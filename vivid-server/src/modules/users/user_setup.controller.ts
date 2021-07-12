import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Patch,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { AccountNotSetupGuard } from '~/middleware/guards/auth.guards';
import {
  FullDetailsUser,
  IUser,
  UserEntity,
  UsernameChangeDto,
} from '~/models/user.entity';
import { formatObject } from '~/utils/format';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AccountNotSetupGuard)
export class UserSetupController {
  constructor(private userService: UserService) {}

  // TODO private vs public data
  @Get(':id')
  async findUser(
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<any> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    const userRet = await this.userService.findUser(usr.id);
    return formatObject(FullDetailsUser, userRet);
  }

  @Patch('/:id/name')
  changeName(
    @UserParam('id') user: IUserParam,
    @Body() newName: UsernameChangeDto,
  ): Promise<IUser> {
    return this.userService.updateName(user.id, newName.username);
  }

  @Delete(':id')
  deleteUser(@UserParam('id') usr: IUserParam, @User() user: UserEntity) {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return this.userService.deleteUser(usr.id);
  }
}
