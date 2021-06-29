import { sign } from 'jsonwebtoken';
import { User } from '../types/backingTypes';

export class JWT {
  static CREATE_ACCESS_TOKEN(user: User) {
    return sign(
      { email: user.email, id: user.id, fullName: user.fullName },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: '10 days',
        subject: user.id,
      },
    );
  }
  static CREATE_REFRESH_TOKEN(user: User) {
    return sign(
      { email: user.email, id: user.id, fullName: user.fullName },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: '100 days',
        subject: user.id,
      },
    );
  }
}
