import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { POLL_OPTION_ID_PREFIX } from '../constants';
import { redis } from '../redis';
import { MyContext } from '../types/myContext';
import { Poll } from './poll.entity';
import { PollOptionRepository, PollRepository, VoteRepository } from './poll.repository';
import { ErrorResponse } from 'src/user/shared/errorResponse';
import { errorMessage } from 'src/user/shared/errorMessage';
import { Vote } from './vote.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(PollRepository)
    private readonly pollRepo: PollRepository,

    @InjectRepository(PollOptionRepository)
    private readonly pollOptionRepo: PollOptionRepository,

    @InjectRepository(Vote)
    private readonly voteRepo: VoteRepository,
  ) {}
  async createPoll(
    userId: string,
    name: string,
    options: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Boolean | ErrorResponse[]> {
    if (startDate.getTime() >= endDate.getTime()) {
      return errorMessage('email', 'startDate should greater than endDate');
    }

    const poll = await this.pollRepo.insert({
      name,
      userId,
      startDate,
      endDate,
    });

    options.map(async text => {
      await this.pollOptionRepo.insert({
        text,
        votes: ,
        pollId: poll.raw[0].id,
      });
    });

    return true;
  }

  async vote(
    pollOptionId: number,
    userId: string,
  ): Promise<Boolean | ErrorResponse[]> {
    const pollOption = await this.pollOptionRepo.findOne({
      relations: ['poll'],
      where: { id: pollOptionId },
    });

    if (
      (await pollOption.poll).startDate.getTime() > new Date().getTime() ||
      (await pollOption.poll).endDate.getTime() < new Date().getTime()
    ) {
      return errorMessage('poll', 'this poll is closed');
    }

    const voted = await redis.sismember(
      `${POLL_OPTION_ID_PREFIX}${pollOption.pollId}`,
      userId,
    );
    if (voted) {
      return false;
    }

    await this.pollOptionRepo.update(
      { id: pollOptionId },
      { votes: pollOption.votes + 1 },
    );

    await redis.sadd(`${POLL_OPTION_ID_PREFIX}${pollOption.pollId}`, userId);
    return true;
  }

  async poll(id: number): Promise<Poll> {
    return await this.pollRepo.findOne({
      where: { id },
      relations: ['pollOption'],
    });
  }

  async allPolls(take: number, skip: number): Promise<Poll[]> {
    return this.pollRepo
      .createQueryBuilder('poll')
      .innerJoinAndSelect('poll.pollOption', 'pollOption')
      .orderBy('poll.name', 'ASC')
      .take(take)
      .skip(skip)
      .getMany();
  }

  async deletePoll(ctx: MyContext, id: number): Promise<Boolean> {
    try {
      await this.pollRepo.delete({ id });
      const ip =
        ctx.req.header('x-forwarded-for') || ctx.req.connection.remoteAddress;

      await redis.srem(`${POLL_OPTION_ID_PREFIX}${id}`, ip);
    } catch (err) {
      return false;
    }
    return true;
  }

  async myPoll(userId: string): Promise<Poll[]> {
    return await this.pollRepo.find({ where: { userId } });
  }
}
