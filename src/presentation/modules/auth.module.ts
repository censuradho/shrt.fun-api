import { FastifyInstance } from "fastify";
import { AuthenticationController } from "../controller/authentication.controller";
import { SignUpWithEmailAndPasswordUseCase } from "@/application/useCases/SignUpWithEmailAndPassword.useCase";
import { SupabaseAuthGateway } from "@/infra/auth/SupabaseAuthGateway";
import { supabaseClient } from "@/infra/auth/client";
import { UserRepository } from "@/infra/repositories/user/UserRepository.prisma";
import { PlanRepository } from "@/infra/repositories/plan/PlanRepository.prisma";
import { prisma } from "@/infra/database/prisma";
import { envProvider } from "@/infra/config/ProcessEnvProvider";

export function makeAuthController(app: FastifyInstance): AuthenticationController {
  const supabaseAuthGateway = new SupabaseAuthGateway(supabaseClient, envProvider)
  const userRepository = new UserRepository(prisma)
  const planRepository = new PlanRepository(prisma)

  const signUpWithEmailAndPasswordUseCase = new SignUpWithEmailAndPasswordUseCase(
    supabaseAuthGateway,
    userRepository,
    planRepository,
    app
  )

  return new AuthenticationController(
    signUpWithEmailAndPasswordUseCase,
    userRepository,
    app
  )
}