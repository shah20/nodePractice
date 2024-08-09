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
    return 'This action returns all users';
  }

  @Get('/:id')
  getOne(@Param('id') id: number) {
    return 'This action returns user #' + id;
  }

  @Post()
  async post(@Body() user: any) {
    return this.userService.createUser(user);
  }

  @Put('/:id')
  put(@Param('id') id: number, @Body() user: any) {
    return `Updating a user... ${id}`;
  }

  @Delete('/:id')
  remove(@Param('id') id: number) {
    return `Removing user... ${id}`;
  }
}