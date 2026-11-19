import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family, FamilyDocument } from './schemas/family.schema';
import { FamilyMember, FamilyMemberDocument } from './schemas/family-member.schema';
import { Invitation, InvitationDocument } from './schemas/invitation.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private readonly familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMember.name) private readonly memberModel: Model<FamilyMemberDocument>,
    @InjectModel(Invitation.name) private readonly invitationModel: Model<InvitationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createFamily(userId: Types.ObjectId, dto: CreateFamilyDto) {
    const family = await this.familyModel.create({
      name: dto.name,
      ownerId: userId,
      status: 'active',
    });

    // O criador é automaticamente adicionado como Administrador ativo
    await this.memberModel.create({
      familyId: family._id,
      userId,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(),
    });

    return family;
  }

  async getCurrentFamily(userId: Types.ObjectId) {
    const membership = await this.memberModel
      .findOne({ userId, status: 'active' })
      .populate('familyId');

    if (!membership || !membership.familyId) {
      return null;
    }

    return {
      family: membership.familyId,
      role: membership.role,
    };
  }

  async getFamilyMembers(userId: Types.ObjectId) {
    const current = await this.getCurrentFamily(userId);
    if (!current) {
      throw new NotFoundException('Você não pertence a nenhum grupo familiar ativo');
    }

    const familyId = (current.family as any)._id;
    const members = await this.memberModel
      .find({ familyId, status: 'active' })
      .populate('userId', 'name email preferences.theme');

    return members;
  }

  async inviteMember(userId: Types.ObjectId, dto: InviteMemberDto) {
    const current = await this.getCurrentFamily(userId);
    if (!current) {
      throw new BadRequestException('Você precisa criar ou pertencer a uma família primeiro');
    }

    if (current.role !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem convidar membros');
    }

    const familyId = (current.family as any)._id;

    // Verificar se o usuário já existe
    const targetUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (targetUser) {
      const existingMember = await this.memberModel.findOne({
        familyId,
        userId: targetUser._id,
        status: 'active',
      });
      if (existingMember) {
        throw new BadRequestException('Este usuário já é participante da família');
      }

      // Adiciona como membro ativo diretamente
      return this.memberModel.create({
        familyId,
        userId: targetUser._id,
        role: dto.role || 'member',
        status: 'active',
        joinedAt: new Date(),
      });
    }

    // Caso não exista ainda, registra o convite
    const invitation = await this.invitationModel.create({
      familyId,
      email: dto.email.toLowerCase(),
      invitedBy: userId,
      role: dto.role || 'member',
      status: 'pending',
    });

    return invitation;
  }

  async removeMember(adminUserId: Types.ObjectId, memberRecordId: string) {
    const current = await this.getCurrentFamily(adminUserId);
    if (!current || current.role !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem remover membros');
    }

    const member = await this.memberModel.findById(memberRecordId);
    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (member.userId.toString() === adminUserId.toString()) {
      throw new BadRequestException('O administrador proprietário não pode remover a si mesmo');
    }

    member.status = 'removed';
    await member.save();

    return { message: 'Participante removido com sucesso' };
  }
}
