import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignUpWithEmailAndPasswordUseCase } from '@/modules/auth/application/use-cases/SignUpWithEmailAndPassword.useCase';
import { USER_ERRORS_MESSAGES } from '@/modules/user/domain/errors/user.errors';
import { AUTHENTICATION_ERROR_MESSAGES } from '@/modules/auth/domain/errors/authentication.errors';
import { HTTP_STATUS_CODES } from '@/shared/constants/httpStatusCodes';

vi.mock('@/shared/utils/delay', () => ({ delay: vi.fn().mockResolvedValue(undefined) }));

const INPUT = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
};

const FREE_PLAN = {
  id: 'plan-id',
  name: 'FREE',
  monthlyLinkLimit: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeUserRepository = () => ({
  create: vi.fn().mockResolvedValue('user-id'),
  checkIfExistsByEmail: vi.fn().mockResolvedValue(false),
  findUserBySupabaseId: vi.fn(),
  delete: vi.fn().mockResolvedValue(undefined),
  me: vi.fn(),
});

const makePlanRepository = () => ({
  findById: vi.fn(),
  findByName: vi.fn().mockResolvedValue(FREE_PLAN),
});

const makeAuthGateway = () => ({
  signUpWithEmailAndPassword: vi.fn().mockResolvedValue({ id: 'supabase-id' }),
  signInWithEmailAndPassword: vi.fn(),
  verifyToken: vi.fn(),
});

const makeEnvProvider = () => ({
  get: vi.fn().mockReturnValue('http://localhost:3000'),
});

const makeApp = () => ({
  log: { error: vi.fn() },
});

beforeEach(() => vi.clearAllMocks());

describe('SignUpWithEmailAndPasswordUseCase', () => {
  it('should create user successfully', async () => {
    const userRepository = makeUserRepository();
    const authGateway = makeAuthGateway();
    const useCase = new SignUpWithEmailAndPasswordUseCase(
      authGateway as any,
      userRepository as any,
      makePlanRepository() as any,
      makeEnvProvider() as any,
      makeApp() as any,
    );

    await useCase.execute(INPUT);

    expect(authGateway.signUpWithEmailAndPassword).toHaveBeenCalledWith({
      email: INPUT.email,
      password: INPUT.password,
      options: { emailRedirectTo: 'http://localhost:3000' },
    });
    expect(userRepository.create).toHaveBeenCalledWith({
      email: INPUT.email,
      firstName: INPUT.firstName,
      lastName: INPUT.lastName,
      supabaseId: 'supabase-id',
      planId: FREE_PLAN.id,
    });
  });

  it('should throw CONFLICT if user already exists', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.checkIfExistsByEmail).mockResolvedValue(true);

    const useCase = new SignUpWithEmailAndPasswordUseCase(
      makeAuthGateway() as any,
      userRepository as any,
      makePlanRepository() as any,
      makeEnvProvider() as any,
      makeApp() as any,
    );

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      message: USER_ERRORS_MESSAGES.USER_ALREADY_EXISTS,
      status: HTTP_STATUS_CODES.CONFLICT,
    });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should throw SIGN_UP_FAILED if free plan not found', async () => {
    const planRepository = makePlanRepository();
    vi.mocked(planRepository.findByName).mockResolvedValue(null);

    const useCase = new SignUpWithEmailAndPasswordUseCase(
      makeAuthGateway() as any,
      makeUserRepository() as any,
      planRepository as any,
      makeEnvProvider() as any,
      makeApp() as any,
    );

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      message: AUTHENTICATION_ERROR_MESSAGES.SIGN_UP_FAILED,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  });

  it('should throw SIGN_UP_FAILED if auth gateway fails', async () => {
    const authGateway = makeAuthGateway();
    vi.mocked(authGateway.signUpWithEmailAndPassword).mockRejectedValue(new Error('Supabase down'));

    const useCase = new SignUpWithEmailAndPasswordUseCase(
      authGateway as any,
      makeUserRepository() as any,
      makePlanRepository() as any,
      makeEnvProvider() as any,
      makeApp() as any,
    );

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      message: AUTHENTICATION_ERROR_MESSAGES.SIGN_UP_FAILED,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  });
});
