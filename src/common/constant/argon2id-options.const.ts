import type { Options } from 'argon2';
import { argon2id } from 'argon2';

// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
export const argon2idOptions: Options = {
  type: argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};
