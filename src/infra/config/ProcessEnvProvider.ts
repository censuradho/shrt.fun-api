import "dotenv/config";

import { IEnvProvider, LocalEnvironmentVars } from "@/domain/EnvProvider";
import { env } from "./env.dto";

export class ProcessEnvProvider implements IEnvProvider {
  get(key: keyof LocalEnvironmentVars): string | undefined {
    return env[key];
  }
}

export const envProvider = new ProcessEnvProvider()