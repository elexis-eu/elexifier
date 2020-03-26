export interface AuthenticatedUser {
  admin: boolean;
  auth_token: string;
  email: string;
  username: string;
}
