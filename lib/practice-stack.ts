import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
// import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';

type DynamoDBTableMap = Record<string, Table>;
type LambdFunctionsMap = Record<string, NodejsFunction>;

export interface PracticeStackProps extends cdk.StackProps {
  additionalProps: Record<string, any>; // Add your custom property here
}

export class PracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: PracticeStackProps) {
    super(scope, id, props);

    const tables: DynamoDBTableMap = this.createDynamoDBTable(props);
    const functions: LambdFunctionsMap = this.createLambdaFunctions(tables, props);
  }

  private createDynamoDBTable(props?: PracticeStackProps): DynamoDBTableMap {

    const keysTable = new Table(this, 'Keys', {
      tableName: `Keys-${props?.additionalProps.namespace}`,
      partitionKey: { name: 'tableName', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      replicationRegions: ['us-east-2'],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const usersTable = new Table(this, 'Users', {
      tableName: `Users-${props?.additionalProps.namespace}`,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      pointInTimeRecovery: true,
      billingMode: BillingMode.PAY_PER_REQUEST,
      replicationRegions: ['us-east-2'],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // If billingMode: dynamodb.BillingMode.PROVISIONED is set, then read and write capacity needs to be set
    // const readScaling = usersTable.autoScaleReadCapacity({ minCapacity: 1, maxCapacity: 10 });

    // readScaling.scaleOnUtilization({
    //   targetUtilizationPercent: 65
    // });

    // const writeScaling = usersTable.autoScaleWriteCapacity({ minCapacity: 1, maxCapacity: 10 });

    // writeScaling.scaleOnUtilization({
    //   targetUtilizationPercent: 70
    // });

    // writeScaling.scaleOnSchedule('ScaleUpInMorning', {
    //   schedule: Schedule.cron({ hour: '6', minute: '30' }),
    //   maxCapacity: 10,
    //   minCapacity: 5,
    // });

    // writeScaling.scaleOnSchedule('ScaleDownInNight', {
    //   schedule: Schedule.cron({ hour: '22', minute: '00' }),
    //   maxCapacity: 5,
    //   minCapacity: 1,
    // });

    return { keysTable, usersTable };
  }

  private createLambdaFunctions(tables: DynamoDBTableMap,props?: PracticeStackProps): LambdFunctionsMap {
    const configLayer = new LayerVersion(this, `config-assets-layer`, {
      code: Code.fromAsset(`${__dirname}/../config`),
    });

    const DB_TABLES = Object.values(tables).map((table) => table.tableName).join(',');

    // This construct is specifically designed for Node.js Lambda functions.
    const appLambda = new NodejsFunction(this, 'Application', {
      runtime: lambda.Runtime.NODEJS_20_X,
      functionName: `Application-${props?.additionalProps.namespace}`,
      entry: path.join(__dirname, 'lambda/application.ts'),
      handler: 'applicationHandler',
      // Config files are passed as a layer
      layers: [configLayer],
      // Lambda extracts the layer contents into the /opt directory in the function execution environment
      environment: {
        DB_TABLES,
        NODE_CONFIG_DIR: '/opt',
        USERS_TABLE: tables.usersTable.tableName,
        KEYS_TABLE: tables.keysTable.tableName,
      },
      bundling: {
        nodeModules: ['esbuild'],
      }
    });

    tables.usersTable.grantReadWriteData(appLambda);
    tables.keysTable.grantReadWriteData(appLambda);

    const appFunctionUrl = appLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "ApplicationUrl", {
      value: appFunctionUrl.url,
    });

    const inlineFunction = new lambda.Function(this, 'InlineHelloWorld', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      functionName: `InlineHelloWorld-${props?.additionalProps.namespace}`,
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            body: JSON.stringify('Hello CDK!'),
          };
        };
      `),
    });

    return { appLambda, inlineFunction };
  }
}
