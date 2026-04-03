import { SignUpWithEmailAndPasswordUseCase } from '@/modules/auth/application/use-cases/SignUpWithEmailAndPassword.useCase';
import { supabaseClient } from '@/modules/auth/infra/auth/client';
import { SupabaseAuthGateway } from '@/modules/auth/infra/auth/SupabaseAuthGateway';
import { PlanRepository } from '@/modules/auth/infra/repositories/PlanRepository.prisma';
import { AuthenticationController } from '@/modules/auth/presentation/controllers/authentication.controller';
import { UserRepository } from '@/modules/user/infra/repositories/UserRepository.prisma';
import { envProvider } from '@/infra/config/ProcessEnvProvider';
import { prisma } from '@/infra/database/prisma';
import { FastifyInstance } from 'fastify';

export function makeAuthController(app: FastifyInstance): AuthenticationController {
  const supabaseAuthGateway = new SupabaseAuthGateway(supabaseClient, envProvider);
  const userRepository = new UserRepository(prisma);
  const planRepository = new PlanRepository(prisma);

  const signUpWithEmailAndPasswordUseCase = new SignUpWithEmailAndPasswordUseCase(
    supabaseAuthGateway,
    userRepository,
    planRepository,
    envProvider,
    app,
  );

  return new AuthenticationController(
    signUpWithEmailAndPasswordUseCase,
    userRepository,
    app,
  );
}
