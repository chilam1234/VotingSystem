import { EntityRepository, Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { PollOption } from './pollOption.entity';
import { Vote } from './vote.entity';

@EntityRepository(Poll)
export class PollRepository extends Repository<Poll> {}

@EntityRepository(PollOption)
export class PollOptionRepository extends Repository<PollOption> {}

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {}
