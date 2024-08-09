import { JsonController, Put } from "routing-controllers";
import { DBHelperService } from "../services/DBHelperService";
import Container from "typedi";

@JsonController('/db')
export class DBHelperController {

  private DBHelperService: DBHelperService;

  DB_TABLES = process.env.DB_TABLES?.split(',');
  KEYS_TABLE = process.env.KEYS_TABLE;

  constructor() {
    this.DBHelperService = Container.get(DBHelperService);
  }

  @Put('/initKeys')
  async initializeKeys() {
    return this.DBHelperService.initializeKeys();
  }
}