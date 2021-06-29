import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const asyncScrypt = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await asyncScrypt(password, salt, 64)) as Buffer;
    return { hashedPassword: buf.toString('hex'), salt };
  }
  static async compare(
    storedPassword: string,
    storedSalt: string,
    suppliedPassword: string,
  ) {
    const buf = (await asyncScrypt(suppliedPassword, storedSalt, 64)) as Buffer;
    return buf.toString('hex') === storedPassword;
  }
}
