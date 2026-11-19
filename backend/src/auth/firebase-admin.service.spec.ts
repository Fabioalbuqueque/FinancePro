import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';

class MockRequest {
  user?: AuthenticatedUser;
  headers = { authorization: '' };
}

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'development';
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => undefined),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(FirebaseAdminService);
    service.onModuleInit();
  });

  describe('verifyIdToken', () => {
    it('aceita token mock em desenvolvimento quando não há credenciais reais', async () => {
      const result = await service.verifyIdToken('mock-token-abc123');
      expect(result.uid).toBe('abc123');
      expect(result.email).toBe('abc123@financepro.local');
    });

    it('rejeita token real quando não há credenciais do Firebase Admin', async () => {
      await expect(service.verifyIdToken('token-real-exemplo')).rejects.toThrow(UnauthorizedException);
    });
  });
});

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let request: MockRequest;

  beforeEach(async () => {
    process.env.NODE_ENV = 'development';
    const moduleRef = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: FirebaseAdminService,
          useValue: {
            verifyIdToken: jest.fn(async () => ({
              uid: 'user-real',
              email: 'real@user.com',
              name: 'User Real',
            })),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get(FirebaseAuthGuard);
    request = new MockRequest();
  });

  const createContext = () =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as any;

  it('rejeita requisições sem cabeçalho de autenticação', async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita tokens não no formato Bearer', async () => {
    request.headers.authorization = 'invalid-token';
    await expect(guard.canActivate(createContext())).rejects.toThrow(UnauthorizedException);
  });

  it('aceita token mock em desenvolvimento', async () => {
    request.headers.authorization = 'Bearer mock-token-teste';
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(request.user).toEqual({
      uid: 'teste',
      email: 'teste@financepro.local',
      name: 'User teste',
    });
  });

  it('usa o serviço Firebase para validar token real', async () => {
    request.headers.authorization = 'Bearer token-real';
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(request.user).toEqual({
      uid: 'user-real',
      email: 'real@user.com',
      name: 'User Real',
    });
  });
});