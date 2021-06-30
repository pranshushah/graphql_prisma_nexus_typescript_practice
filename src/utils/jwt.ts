import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { Response } from 'express';
export class JWT {
  static CREATE_ACCESS_TOKEN(user: User) {
    return sign(
      { email: user.email, id: user.id, fullName: user.fullName },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: '5m',
        subject: user.id,
      },
    );
  }
  static CREATE_REFRESH_TOKEN(user: User, res: Response) {
    const refreshToken = sign(
      {
        email: user.email,
        id: user.id,
        fullName: user.fullName,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: '100 days',
        subject: user.id,
      },
    );
    res.cookie(process.env.JWT_COKKIE_NAME!, refreshToken, {
      httpOnly: true,
    });
  }
}
