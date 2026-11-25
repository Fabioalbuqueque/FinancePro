import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransactionsService } from './transactions.service';

const user = new Types.ObjectId();
const family = new Types.ObjectId();
const account = new Types.ObjectId();

function createTransactionModel(transactions: any[] = []) {
  const findResponse: any = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(transactions.map((t) => ({ ...t }))),
  };
  return {
    create: jest.fn(async (data) => ({ _id: `tx-${Math.random()}`, ...data })),
    findById: jest.fn(async (id) => transactions.find((t) => t._id === id) || null),
    findByIdAndDelete: jest.fn(async (id) => transactions.find((t) => t._id === id) || null),
    deleteMany: jest.fn(async () => ({ deletedCount: 1 })),
    find: findResponse.find,
    countDocuments: jest.fn(async () => transactions.length),
  };
}

function createAuditModel() {
  return { create: jest.fn(async () => ({ _id: 'audit' })) };
}

function createAccountsService() {
  return {
    getAccountById: jest.fn(async () => ({ _id: account, ownerType: 'user', ownerId: user })),
    getOrCreateDefaultAccount: jest.fn(async () => ({ _id: account, ownerType: 'user', ownerId: user })),
  };
}

function createFamiliesService() {
  return {
    getCurrentFamily: jest.fn(async () => ({ family: { _id: family }, role: 'admin' })),
  };
}

describe('TransactionsService', () => {
  let service: TransactionsService;
  let model: ReturnType<typeof createTransactionModel>;
  let auditModel: ReturnType<typeof createAuditModel>;
  let accountsService: ReturnType<typeof createAccountsService>;
  let familiesService: ReturnType<typeof createFamiliesService>;

  beforeEach(() => {
    model = createTransactionModel();
    auditModel = createAuditModel();
    accountsService = createAccountsService();
    familiesService = createFamiliesService();
    service = new TransactionsService(
      model as any,
      auditModel as any,
      accountsService as any,
      familiesService as any,
    );
  });

  it('cria uma transação e registra auditoria', async () => {
    const tx = await service.createTransaction(user, {
      description: 'Salário',
      amountCents: 150000,
      type: 'income',
      accountId: account.toString(),
      date: '2026-11-18',
      status: 'paid',
    } as any);
    expect(tx.description).toBe('Salário');
    expect(model.create).toHaveBeenCalled();
    expect(auditModel.create).toHaveBeenCalled();
  });

  it('proíbe edição por membro quando não é criador nem admin', async () => {
    const member = new Types.ObjectId();
    const otherTransaction = { _id: 'tx-other', userId: user, ownerType: 'user', ownerId: user };
    model.findById.mockResolvedValueOnce(otherTransaction as any);
    familiesService.getCurrentFamily.mockResolvedValueOnce(null);
    await expect(
      service.updateTransaction(member, 'tx-other', { description: 'x' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('proíbe exclusão de lançamento pessoal por outro usuário', async () => {
    const member = new Types.ObjectId();
    const transaction = { _id: 'tx-1', userId: user, ownerType: 'user', ownerId: user };
    model.findById.mockResolvedValueOnce(transaction as any);
    await expect(service.deleteTransaction(member, 'tx-1')).rejects.toThrow(ForbiddenException);
  });

  it('admin pode excluir lançamento familiar e remove o par da transferência', async () => {
    const transaction = {
      _id: 'tx-1',
      userId: user,
      ownerType: 'family',
      ownerId: family,
      transferId: 'pair-1',
    };
    model.findById.mockResolvedValueOnce(transaction as any);
    await expect(service.deleteTransaction(user, 'tx-1')).resolves.toMatchObject({
      message: expect.any(String),
    });
    expect(model.deleteMany).toHaveBeenCalledWith({ transferId: 'pair-1' });
  });

  it('retorna NotFound para transação inexistente', async () => {
    model.findById.mockResolvedValueOnce(null);
    await expect(service.updateTransaction(user, 'nope', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });
});