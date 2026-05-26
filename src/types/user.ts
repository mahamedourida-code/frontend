// User-related types

export type UserRole = 'free' | 'professional' | 'max' | 'mega';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  phone?: string;
  company?: string;
  timezone?: string;
  language?: string;
}

export type AuthProvider = 'google' | 'github' | 'facebook';

export interface OAuthSignInRequest {
  provider: AuthProvider;
  redirectTo?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}
