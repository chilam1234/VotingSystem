import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Poll } from './poll.entity';
import { Vote } from './vote.entity';
@ObjectType()
@Entity()
export class PollOption {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  text: string;

  @Field(() => [Vote])
  @OneToMany(() => Vote, vote => vote.pollOption)
  votes: Vote[];

  @Field()
  @Column()
  pollId: number;

  @ManyToOne(() => Poll, poll => poll.pollOption, { onDelete: 'CASCADE' })
  poll: Promise<Poll>;

}
