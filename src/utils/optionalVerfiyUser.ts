import { verify } from 'jsonwebtoken';
import { Payload } from '../types/backingTypes';

/**
 *
 * @description this verify user does not throw error when we do not provide token or provide invalid token.
 * @returns payload of the token of null if token is not valid.
 */
export function optionalVerifyUser(authToken: string) {
  if (authToken !== '') {
    try {
      const token = authToken.split(' ')[1];
      // ! says it can not be undefined
      const payload = verify(token, process.env.JWT_ACCESS_SECRET!);
      // trust me it returns this type. for more details go to utils/jwt.ts
      return payload as Payload;
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }
}
