import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.firebaseApp = admin.apps[0];
      return;
    }

    const serviceAccountPath = this.configService.get<string>('firebase.serviceAccountPath');
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey')
      ? this.configService.get<string>('firebase.privateKey').replace(/\\n/g, '\n')
      : undefined;

    try {
      if (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) {
        const fileContent = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(fileContent),
        });
        this.logger.log('Firebase Admin inicializado com arquivo de credenciais.');
      } else if (projectId && clientEmail && privateKey) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin inicializado com variáveis de ambiente.');
      } else {
        // Fallback para desenvolvimento sem credenciais rígidas
        this.logger.warn('Firebase Admin não configurado. Usando modo desenvolvimento com tokens mock.');
      }
    } catch (error: any) {
      this.logger.warn(`Firebase Admin não configurado totalmente: ${error.message}`);
    }
  }

  private hasCredentials(): boolean {
    const serviceAccountPath = this.configService.get<string>('firebase.serviceAccountPath');
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    return Boolean(
      (serviceAccountPath && fs.existsSync(path.resolve(serviceAccountPath))) ||
      (projectId && clientEmail && privateKey)
    );
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.hasCredentials()) {
      if (process.env.NODE_ENV === 'development' && token.startsWith('mock-token-')) {
        const uid = token.replace('mock-token-', '');
        return {
          uid,
          email: `${uid}@financepro.local`,
          name: `User ${uid}`,
        } as unknown as admin.auth.DecodedIdToken;
      }

      throw new UnauthorizedException('Configure as credenciais do Firebase Admin para validar tokens reais');
    }

    if (!this.firebaseApp) {
      throw new UnauthorizedException('Firebase Admin não está inicializado');
    }

    return admin.auth().verifyIdToken(token);
  }
}
