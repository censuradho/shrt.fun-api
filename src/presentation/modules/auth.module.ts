import { FastifyInstance } from "fastify";
import { AuthenticationController } from "../controller/authentication.controller";
import { SignUpWithEmailAndPasswordUseCase } from "@/application/useCases/SignUpWithEmailAndPassword.useCase";
import { SupabaseAuthGateway } from "@/infra/auth/SupabaseAuthGateway";
import { supabaseClient } from "@/infra/auth/client";
import { UserRepository } from "@/infra/repositories/user/UserRepository.prisma";
import { prisma } from "@/infra/database/prisma";

export function makeAuthController(app: FastifyInstance): AuthenticationController {
  const supabaseAuthGateway = new SupabaseAuthGateway(supabaseClient)
  const userRepository = new UserRepository(prisma)

  const signUpWithEmailAndPasswordUseCase = new SignUpWithEmailAndPasswordUseCase(
    supabaseAuthGateway,
    userRepository,
    app
  )

  return new AuthenticationController(
    signUpWithEmailAndPasswordUseCase,
  )
}