import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { MyContext } from '../types/myContext';
import { LoginInput } from './input/user.loginInput';
import { SignupInput } from './input/user.singupInput';
import { errorMessage } from './shared/errorMessage';
import { ErrorResponse } from './shared/errorResponse';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepo: UserRepository,
  ) {}

  async signup(signupInput: SignupInput): Promise<ErrorResponse[] | null> {
    const exist = await this.userRepo.findOne({
      where: { hkId: signupInput.hkId },
    });

    const exist2 = await this.userRepo.findOne({
      where: { userName: signupInput.userName },
    });

    if (exist || exist2) {
      return errorMessage('hkId', 'duplicated username or HKID');
    }

    await this.userRepo.save({ ...signupInput });
    return null;
  }

  async login(
    loginInput: LoginInput,
    req: Request,
  ): Promise<ErrorResponse[] | null> {
    const user = await this.userRepo.findOne({
      where: { userName: loginInput.username },
    });
    if (!user) {
      return errorMessage('username', 'invalid username or password');
    }

    const checkPassword = await bcrypt.compare(
      loginInput.password,
      user.password,
    );

    if (!checkPassword) {
      return errorMessage('username', 'invalid username or password');
    }
    req.session.userId = user.id;
    return null;
  }

  async logout(ctx: MyContext) {
    await ctx.req.session.destroy(err => {
      console.log(err);
      return false;
    });
    await ctx.res.clearCookie('voting-system');
    return true;
  }
}
