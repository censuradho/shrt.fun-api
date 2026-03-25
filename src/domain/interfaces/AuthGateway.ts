export interface SignUpWithEmailAndPasswordParams {
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserParams {
  phone?: string;
}

export interface AuthUser {
  id: string
  email?: string
  phone?: string
  created_at: string
  updated_at?: string
  deleted_at?: string
}

export interface AuthGateway {
  signUpWithEmailAndPassword(params: SignUpWithEmailAndPasswordParams): Promise<AuthUser>;
  updateUser(userId: string, params: UpdateUserParams): Promise<AuthUser>;
  deleteUser(userId: string): Promise<void>
  getUser(token?: string): Promise<AuthUser | null>
}