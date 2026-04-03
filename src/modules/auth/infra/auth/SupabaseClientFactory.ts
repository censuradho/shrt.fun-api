import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseAdminConfig {
  url: string;
  serviceRoleKey: string;
}

export class SupabaseClientFactory {

  static build ({ 
    serviceRoleKey,
    url
  }: SupabaseAdminConfig): SupabaseClient {
    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
}