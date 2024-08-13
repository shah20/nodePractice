import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import Container, { Service } from "typedi";
import { DBHelperService } from "./DBHelperService";
import c from "config";

const USERS_TABLE = process.env.USERS_TABLE;

@Service()
export class UserService {

  private dbHelperService: DBHelperService;

  constructor() {
    this.dbHelperService = Container.get(DBHelperService);
  }

  async createUpdateUser(user: any, id?: string) {
    const putCommand = new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        id: id || (await this.dbHelperService.getNewId(USERS_TABLE!)).toString(),
        name: user.name,
        email: user.email,
      },
      // By default PutItem overrides the record if same Partition key exists
      // By providing below condition it would throw error if Partition key already exists
      ConditionExpression: id ? undefined : 'attribute_not_exists(id)',
    });
    console.log('Creating a user...', { putCommand: JSON.stringify(putCommand)});
    try {
      const result = await this.dbHelperService.getResult(putCommand);
      return { result };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        const errorMessage = `Item with the ${user.id} partition key already exists.`;
        throw new Error(errorMessage);
      } else {
        console.error("An error occurred:", error);
        throw error;
      }
    }
  }

  async getAllUsers() {
    const scanCommand = new ScanCommand({
      TableName: USERS_TABLE!,
    });
    try {
      const result = await this.dbHelperService.getResult(scanCommand);
      return { result };
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }
  
  async getUserByid(id: string) {
    const getCommend = new GetCommand({
      TableName: USERS_TABLE!,
      Key: {
        id: id,
      },
    });
    try {
      const result = await this.dbHelperService.getResult(getCommend);
      return { result };
    } catch(error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    const deleteCommand = new DeleteCommand({
      TableName: USERS_TABLE!,
      Key: {
        id,
      },
      ReturnValues: 'ALL_OLD',
    });
    try {
      const result = await this.dbHelperService.getResult(deleteCommand);
      return { result };
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }
}