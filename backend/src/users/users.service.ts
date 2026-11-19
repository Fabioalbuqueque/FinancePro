import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../common/guards/firebase-auth.guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getOrCreateUser(authUser: AuthenticatedUser): Promise<UserDocument> {
    let user = await this.userModel.findOne({ firebaseUid: authUser.uid });
    if (!user) {
      user = await this.userModel.create({
        firebaseUid: authUser.uid,
        name: authUser.name || 'Usuário FinancePro',
        email: authUser.email || `${authUser.uid}@financepro.local`,
        preferences: {
          theme: 'system',
          currency: 'BRL',
          language: 'pt-BR',
        },
        status: 'active',
      });
    }
    return user;
  }

  async getProfile(firebaseUid: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ firebaseUid, status: 'active' });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async updateProfile(firebaseUid: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      {
        $set: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.preferences ? { preferences: dto.preferences } : {}),
        },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('Usuário não encontrado para atualização');
    }
    return user;
  }
}
