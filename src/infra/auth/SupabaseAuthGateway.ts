import { AuthGateway, AuthUser, SignUpWithEmailAndPasswordParams, UpdateUserParams } from "@/domain/interfaces/AuthGateway";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: SupabaseClient) {}

  async signUpWithEmailAndPassword(params: SignUpWithEmailAndPasswordParams): Promise<AuthUser> {
    const {
      email,
      password,
      phone,
      emailConfirmed,
      phoneConfirmed,
    } = params;

    const { data, error } = await this.client.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: emailConfirmed,
      phone_confirm: phoneConfirmed,
    });

    if (error) throw error;

    return data.user;
  }
  async updateUser(userId: string, params: UpdateUserParams): Promise<AuthUser> {
    const {
      phone,
    } = params;

    const { data, error } = await this.client.auth.admin.updateUserById(userId, {
      phone,
    });

    if (error) throw error;

    return data.user;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}