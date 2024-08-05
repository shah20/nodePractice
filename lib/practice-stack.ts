import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import config from 'config';

export class PracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const configLayer = new LayerVersion(this, `config-assets-layer`, {
      code: Code.fromAsset(`${__dirname}/../config`),
    });

    // This is a general-purpose construct for creating Lambda functions.
    // const appLambda = new lambda.Function(this, 'Application', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.applicationHandler',
    //   functionName: 'Application',
    //   code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
    // });

    // This construct is specifically designed for Node.js Lambda functions.
    const appLambda = new NodejsFunction(this, 'Application', {
      runtime: lambda.Runtime.NODEJS_20_X,
      functionName: 'Application',
      entry: path.join(__dirname, 'lambda/index.ts'),
      handler: 'applicationHandler',
      // Config files are passed as a layer
      layers: [configLayer],
      // Lambda extracts the layer contents into the /opt directory in the function execution environment
      environment: {
        NODE_CONFIG_DIR: '/opt',
      },
      bundling: {
        nodeModules: ['esbuild'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string): string[] {
            return [];
          },
        },
      }
    });

    const appFunctionUrl = appLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, "ApplicationUrl", {
      value: appFunctionUrl.url,
    });

    const inlineFunction = new lambda.Function(this, 'InlineHelloWorld', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      functionName: 'InlineHelloWorld',
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            body: JSON.stringify('Hello CDK!'),
          };
        };
      `),
    });
  }
}
