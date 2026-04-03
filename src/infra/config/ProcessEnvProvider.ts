import "dotenv/config";

import { IEnvProvider, LocalEnvironmentVars } from "@/shared/types/interfaces/EnvProvider";

export class ProcessEnvProvider implements IEnvProvider {
  get(key: keyof LocalEnvironmentVars): string | undefined {
    return process.env[key];
  }
}

export const envProvider = new ProcessEnvProvider()