import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    private readonly familiesService: FamiliesService,
  ) {}

  async createAccount(userId: Types.ObjectId, dto: CreateAccountDto) {
    let ownerId = userId;
    let ownerType = dto.ownerType || 'user';

    if (ownerType === 'family') {
      const current = await this.familiesService.getCurrentFamily(userId);
      if (!current) {
        throw new BadRequestException('Usuário não pertence a nenhuma família ativa');
      }
      ownerId = (current.family as any)._id;
    }

    return this.accountModel.create({
      name: dto.name,
      ownerType,
      ownerId,
      type: dto.type,
      initialBalanceCents: dto.initialBalanceCents || 0,
      status: 'active',
    });
  }

  async listUserAccounts(userId: Types.ObjectId) {
    // Busca contas pessoais
    const personalAccounts = await this.accountModel.find({
      ownerType: 'user',
      ownerId: userId,
      status: 'active',
    });

    // Busca se usuário tem família ativa
    const currentFamily = await this.familiesService.getCurrentFamily(userId);
    let familyAccounts = [];
    if (currentFamily) {
      familyAccounts = await this.accountModel.find({
        ownerType: 'family',
        ownerId: (currentFamily.family as any)._id,
        status: 'active',
      });
    }

    return {
      personal: personalAccounts,
      family: familyAccounts,
    };
  }

  async getAccountById(accountId: string, userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(accountId)) {
      throw new BadRequestException('Identificador de conta inválido');
    }
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (account.ownerType === 'user' && account.ownerId.toString() !== userId.toString()) {
      throw new ForbiddenException('Acesso negado a esta conta');
    }

    if (account.ownerType === 'family') {
      const currentFamily = await this.familiesService.getCurrentFamily(userId);
      if (!currentFamily || (currentFamily.family as any)._id.toString() !== account.ownerId.toString()) {
        throw new ForbiddenException('Acesso negado à conta familiar');
      }
    }

    return account;
  }

  async getOrCreateDefaultAccount(userId: Types.ObjectId) {
    let account = await this.accountModel.findOne({
      ownerType: 'user',
      ownerId: userId,
      status: 'active',
    });

    if (!account) {
      account = await this.accountModel.create({
        name: 'Principal',
        ownerType: 'user',
        ownerId: userId,
        type: 'checking',
        initialBalanceCents: 0,
        status: 'active',
      });
    }

    return account;
  }
}
