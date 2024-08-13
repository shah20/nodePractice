import { JsonController, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { UserService } from "../services/UserService";
import Container from "typedi";

@JsonController('/users')
export class UserController {

  private userService: UserService;

  constructor() {
    this.userService = Container.get(UserService);
  }

  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.userService.getUserByid(id);
  }

  @Post()
  async post(@Body() user: any) {
    return this.userService.createUpdateUser(user);
  }

  @Put('/:id')
  put(@Body() user: any, @Param('id') id: string) {
    return this.userService.createUpdateUser(user, id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}