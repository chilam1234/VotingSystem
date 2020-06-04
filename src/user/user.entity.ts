import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Poll } from '../poll/poll.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  hkId: string;

  @Column()
  password: string;

  @OneToMany(() => Poll, poll => poll.user)
  poll: Promise<Poll[]>;
}
