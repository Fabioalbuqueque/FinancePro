import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../auth/firebase-admin.service';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseService: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Suporte para tokens mock em desenvolvimento
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
        const uid = token.replace('mock-token-', '');
        request.user = {
          uid,
          email: `${uid}@financepro.local`,
          name: `User ${uid}`,
        } as AuthenticatedUser;
        return true;
      }

      // Validação real de tokens Firebase
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      } as AuthenticatedUser;

      return true;
    } catch (error: any) {
      this.logger.error(`Falha ao validar token Firebase: ${error.message}`);

      // Em desenvolvimento, permitir tokens mock mesmo sem Firebase configurado
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
        const uid = token.replace('mock-token-', '');
        request.user = {
          uid,
          email: `${uid}@financepro.local`,
          name: `User ${uid}`,
        } as AuthenticatedUser;
        return true;
      }

      throw new UnauthorizedException('Token de autenticação inválido ou expirado');
    }
  }
}
