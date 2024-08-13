import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Service } from "typedi";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  },
});

const DB_TABLES = process.env.DB_TABLES?.split(',');
const KEYS_TABLE = process.env.KEYS_TABLE;

@Service()
export class DBHelperService {

  async initializeKeys() {
    const result: any = {};
    for (let i = 0; i < DB_TABLES!.length; i++) {
      const tableName = DB_TABLES![i];
      const putCommand = new PutCommand({
        TableName: KEYS_TABLE,
        Item: {
          tableName,
          id: 0,
        },
        ConditionExpression: 'attribute_not_exists(tableName)',
      });
      try {
        const response = await docClient.send(putCommand);
        result[tableName] = response;
      }
      catch (error) {
        result[tableName] = error;
      }
    }
    return result;
  }

  async getNewId(tableName: string) {
    try {
      const updateCommand = new UpdateCommand({
        TableName: KEYS_TABLE,
        Key: { tableName },
        UpdateExpression: 'SET id = if_not_exists(id, :start) + :increment',
        ExpressionAttributeValues: {
          ':start': 0,
          ':increment': 1,
        },
        ReturnValues: 'UPDATED_NEW',
      });
      const response = await docClient.send(updateCommand);
      return response.Attributes?.id;
    } catch (error) {
      console.error('Error getting new id', error);
      throw error;
    }
  }

  async getResult(command: any) {
    return await docClient.send(command);
  }
}