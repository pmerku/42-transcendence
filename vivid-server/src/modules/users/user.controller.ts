import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { IUser } from '@/user.interface';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IUserParam, UserParam } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { DeleteResult } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  add(@Body() user: IUser): Observable<IUser> {
    return this.userService.add(user);
  }

  @Get()
  findAll(): Observable<IUser[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findUser(
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<IUser> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return await this.userService.findUser(usr.id);
  }

  @Get('matches/:id')
  async findUsermatches(@Param('id') id: string): Promise<IUser | void> {
    return await this.userService.findUserMatches(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() user: IUser,
  ): Promise<IUser | void> {
    return await this.userService.update(id, user);
  }

  @Patch(':id/2fa')
  async twofactorEnable(@UserParam('id') user: IUserParam): Promise<any> {
    if (!user.isSelf) throw new UnauthorizedException();
    const data = await this.userService.enableTwoFactor(user.id);
    return data;
  }

  @Delete(':id/2fa')
  async twofactorDisable(@UserParam('id') user: IUserParam): Promise<any> {
    if (!user.isSelf) throw new UnauthorizedException();
    await this.userService.disableTwoFactor(user.id);
    return {
      status: true,
    };
  }

  @Post('join_guild/:anagram')
  async join_guild(
    @User() user: UserEntity,
    @Param('anagram') anagram: string,
  ): Promise<UserEntity> {
    return this.userService.joinGuild(user.id, anagram);
  }
}
