import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { PollOption } from './pollOption.entity';

@ObjectType()
@Entity()
export class Poll {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  name: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column('date')
  startDate: Date;

  @Field()
  @Column('date')
  endDate: Date;

  @ManyToOne(() => User, user => user.poll)
  user: Promise<User>;

  @Field(() => [PollOption])
  @OneToMany(() => PollOption, pollOption => pollOption.poll)
  pollOption: Promise<PollOption[]>;
}
