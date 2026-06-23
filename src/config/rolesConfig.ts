import { UserRole, User } from '@/types';

export const profileCompletionRoles: string[] = ['roommate'];

export function shouldCompleteProfile(user: User | null): boolean {
  if (!user || !user.role) return false;
  const roleLower = user.role.toLowerCase();
  if (!profileCompletionRoles.includes(roleLower)) return false;
  return !user.state?.trim() || !user.occupation?.trim();
}
