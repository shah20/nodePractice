import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import Container, { Service } from "typedi";
import { DBHelperService } from "./DBHelperService";

const USERS_TABLE = process.env.USERS_TABLE;

@Service()
export class UserService {

  private dbHelperService: DBHelperService;

  constructor() {
    this.dbHelperService = Container.get(DBHelperService);
  }

  async createUser(user: any) {
    const putCommand = new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        id: (await this.dbHelperService.getNewId(USERS_TABLE!)).toString(),
        name: user.name,
        email: user.email,
      },
      // By default PutItem overrides the record if same Partition key exists
      // By providing below condition it would throw error if Partition key already exists
      ConditionExpression: 'attribute_not_exists(id)',
    });
    try {
      const result = await this.dbHelperService.getResult(putCommand);
      return { result};
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
}