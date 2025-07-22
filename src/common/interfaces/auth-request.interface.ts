import type { User } from '@/schemas/user.schema';

export interface AuthRequest extends Request {
  user: User;
}
