import { AuthGateway, AuthUser, SignUpWithEmailAndPasswordParams, UpdateUserParams } from "@/domain/interfaces/AuthGateway";
import { IEnvProvider } from "@/domain/services/EnvProvider";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAuthGateway implements AuthGateway {
  constructor(
    private readonly client: SupabaseClient,
    private readonly envProvider: IEnvProvider
  ) {}

  async signUpWithEmailAndPassword(params: SignUpWithEmailAndPasswordParams): Promise<AuthUser> {
    const {
      email,
      password,
      phone,
    } = params;

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: this.envProvider.get('CLIENT_URL')
      },
      ...(phone && { phone }),
    })

    if (error || !data.user) throw error;

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