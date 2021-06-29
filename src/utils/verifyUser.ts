import { verify } from 'jsonwebtoken';
import { Payload } from '../types/backingTypes';

export function verifyUser(authToken: string) {
  if (authToken !== '') {
    try {
      const token = authToken.split(' ')[1];
      // ! says it can not be undefined
      const payload = verify(token, process.env.JWT_ACCESS_SECRET!);
      // trust me it returns this type. for more details go to utils/jwt.ts
      return payload as Payload;
    } catch (e) {
      throw new Error(e);
    }
  } else {
    throw new Error('you are not authorized');
  }
}
