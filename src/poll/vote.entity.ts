import { Field, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, OneToOne, ManyToOne } from 'typeorm';
import { PollOption } from './pollOption.entity';
import { User } from 'src/user/user.entity';
@ObjectType()
@Entity()
export class Vote {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(()=> PollOption)
  @ManyToOne(() => PollOption, PollOption => PollOption.votes)
  pollOption: Promise<PollOption>;

  @Field(()=>User)
  @OneToOne(() => User)
  user: Promise<User>;
}
