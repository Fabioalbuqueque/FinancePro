import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';
import { FamiliesService } from '../families/families.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly accountsService: AccountsService,
    private readonly familiesService: FamiliesService,
  ) {}

  async createTransaction(userId: Types.ObjectId, dto: CreateTransactionDto) {
    if (dto.categoryId && !Types.ObjectId.isValid(dto.categoryId)) {
      throw new BadRequestException('Identificador de categoria inválido');
    }

    let account;
    if (dto.accountId && Types.ObjectId.isValid(dto.accountId)) {
      account = await this.accountsService.getAccountById(dto.accountId, userId);
    } else {
      account = await this.accountsService.getOrCreateDefaultAccount(userId);
    }

    let ownerId = userId;
    let ownerType = dto.ownerType || 'user';

    if (ownerType === 'family' || account.ownerType === 'family') {
      const currentFamily = await this.familiesService.getCurrentFamily(userId);
      if (!currentFamily) {
        throw new BadRequestException('Usuário não pertence a um grupo familiar ativo');
      }
      ownerType = 'family';
      ownerId = (currentFamily.family as any)._id;
    }

    const transaction = await this.transactionModel.create({
      userId,
      ownerType,
      ownerId,
      accountId: account._id,
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
      type: dto.type,
      amountCents: Math.round(dto.amountCents),
      description: dto.description,
      status: dto.status || 'paid',
      date: dto.date ? new Date(dto.date) : new Date(),
    });

    await this.auditLogModel.create({
      actorId: userId,
      familyId: ownerType === 'family' ? ownerId : undefined,
      entityType: 'transaction',
      entityId: transaction._id,
      action: 'create',
      changes: dto,
    });

    return transaction;
  }

  async createTransfer(userId: Types.ObjectId, dto: CreateTransferDto) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('A conta de origem e destino devem ser diferentes');
    }

    const fromAccount = await this.accountsService.getAccountById(dto.fromAccountId, userId);
    const toAccount = await this.accountsService.getAccountById(dto.toAccountId, userId);

    const transferId = new Types.ObjectId();
    const date = new Date(dto.date);
    const amountCents = Math.round(dto.amountCents);

    // Registro de Saída (origem)
    const debitTransaction = await this.transactionModel.create({
      userId,
      ownerType: fromAccount.ownerType,
      ownerId: fromAccount.ownerId,
      accountId: fromAccount._id,
      type: 'transfer',
      amountCents,
      description: dto.description || `Transferência para ${toAccount.name}`,
      status: 'paid',
      date,
      transferId,
    });

    // Registro de Entrada (destino)
    const creditTransaction = await this.transactionModel.create({
      userId,
      ownerType: toAccount.ownerType,
      ownerId: toAccount.ownerId,
      accountId: toAccount._id,
      type: 'transfer',
      amountCents,
      description: dto.description || `Transferência de ${fromAccount.name}`,
      status: 'paid',
      date,
      transferId,
    });

    await this.auditLogModel.create({
      actorId: userId,
      entityType: 'transaction',
      entityId: transferId,
      action: 'create',
      changes: {
        type: 'transfer',
        from: fromAccount._id,
        to: toAccount._id,
        amountCents,
      },
    });

    return {
      message: 'Transferência realizada com sucesso',
      debit: debitTransaction,
      credit: creditTransaction,
    };
  }

  async listTransactions(userId: Types.ObjectId, filter: FilterTransactionDto) {
    const currentFamily = await this.familiesService.getCurrentFamily(userId);
    const familyId = currentFamily ? (currentFamily.family as any)._id : null;

    const query: any = {};

    if (filter.scope === 'family' && familyId) {
      query.ownerType = 'family';
      query.ownerId = familyId;
    } else if (filter.scope === 'user') {
      query.ownerType = 'user';
      query.ownerId = userId;
    } else {
      // Padrão: traz dados pessoais e se estiver em família, familiares também
      const orClauses: any[] = [{ ownerType: 'user', ownerId: userId }];
      if (familyId) {
        orClauses.push({ ownerType: 'family', ownerId: familyId });
      }
      query.$or = orClauses;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.accountId) {
      query.accountId = new Types.ObjectId(filter.accountId);
    }

    if (filter.categoryId) {
      query.categoryId = new Types.ObjectId(filter.categoryId);
    }

    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = new Date(filter.startDate);
      if (filter.endDate) query.date.$lte = new Date(filter.endDate);
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .populate('accountId', 'name type')
        .populate('categoryId', 'name icon type')
        .populate('userId', 'name email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.transactionModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateTransaction(
    userId: Types.ObjectId,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    // Validação de Permissão (RN-006): apenas criador ou admin familiar pode editar
    if (transaction.userId.toString() !== userId.toString()) {
      if (transaction.ownerType === 'family') {
        const currentFamily = await this.familiesService.getCurrentFamily(userId);
        if (!currentFamily || currentFamily.role !== 'admin') {
          throw new ForbiddenException('Apenas o criador ou o administrador podem editar este lançamento');
        }
      } else {
        throw new ForbiddenException('Apenas o criador pode editar este lançamento');
      }
    }

    Object.assign(transaction, {
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.amountCents !== undefined ? { amountCents: Math.round(dto.amountCents) } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.date ? { date: new Date(dto.date) } : {}),
      ...(dto.categoryId ? { categoryId: new Types.ObjectId(dto.categoryId) } : {}),
      ...(dto.accountId ? { accountId: new Types.ObjectId(dto.accountId) } : {}),
    });

    await transaction.save();

    await this.auditLogModel.create({
      actorId: userId,
      entityType: 'transaction',
      entityId: transaction._id,
      action: 'update',
      changes: dto,
    });

    return transaction;
  }

  async deleteTransaction(userId: Types.ObjectId, transactionId: string) {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    if (transaction.userId.toString() !== userId.toString()) {
      if (transaction.ownerType === 'family') {
        const currentFamily = await this.familiesService.getCurrentFamily(userId);
        if (!currentFamily || currentFamily.role !== 'admin') {
          throw new ForbiddenException('Apenas o criador ou o administrador podem excluir este lançamento');
        }
      } else {
        throw new ForbiddenException('Apenas o criador pode excluir este lançamento');
      }
    }

    // Se for parte de uma transferência, exclui o par atômico
    if (transaction.transferId) {
      await this.transactionModel.deleteMany({ transferId: transaction.transferId });
    } else {
      await this.transactionModel.findByIdAndDelete(transactionId);
    }

    await this.auditLogModel.create({
      actorId: userId,
      entityType: 'transaction',
      entityId: transaction._id,
      action: 'delete',
    });

    return { message: 'Lançamento excluído com sucesso' };
  }
}
