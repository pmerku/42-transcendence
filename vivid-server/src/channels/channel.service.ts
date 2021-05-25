import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { ChannelEntity, IChannel, ChannelDto } from './models/channel.entity';
import {
  JoinedChannelEntity,
  IJoinedChannel,
  IJoinedChannelInput,
} from './models/joined_channels.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelEntity)
    private ChannelRepository: Repository<ChannelEntity>,
    @InjectRepository(JoinedChannelEntity)
    private JoinedChannelRepository: Repository<JoinedChannelEntity>,
  ) {}

  add(channelInput: ChannelDto): Observable<IChannel> {
    return from(this.ChannelRepository.save(channelInput));
  }

  async findChannel(id: string): Promise<IChannel> {
    return await this.ChannelRepository.findOne({
      relations: ['joined_users'],
      where: {
        id,
      },
    });
  }

  findAll(): Observable<IChannel[]> {
    return from(
      this.ChannelRepository.find({
        relations: ['joined_users'],
      }),
    );
  }

  addUser(joinedChannelInput: IJoinedChannelInput): Observable<IJoinedChannel> {
    return from(this.JoinedChannelRepository.save(joinedChannelInput));
  }

  removeUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Observable<DeleteResult> {
    return from(this.JoinedChannelRepository.delete({ ...joinedChannelInput }));
  }
}
