import { envProvider } from "@/infra/config/ProcessEnvProvider";
import { SupabaseClientFactory } from "./SupabaseClientFactory";

export const supabaseClient = SupabaseClientFactory
  .build({
    url: envProvider.get('SUPABASE_URL') || '',
    serviceRoleKey: envProvider.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  })