import type { Team } from '@/schemas/team.schema';

export interface AuthRequest extends Request {
  user: Team;
}
