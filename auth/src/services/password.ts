import { scrypt, randomBytes } from 'crypto';
// `scrypt` is fantastic. the downside is it is callback based
// `promisify` to turn callback based fn into promised based implementation which
// is compatible with using `async await`
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    // Generate salt
    const salt = randomBytes(8).toString('hex');
    // Do the actual password hashing process
    // `scrypt` gives us a buffer which is kind of like an array with raw data
    // inside of it
    // Hash password along with the salt
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    // hashedPassword is the actual truly hashed password that is stored in the
    // database
    // salt is the salt generated during the initial hasing process
    const [hashedPassword, salt] = storedPassword.split('.');
    // Buffer containing a newly hashed password
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
