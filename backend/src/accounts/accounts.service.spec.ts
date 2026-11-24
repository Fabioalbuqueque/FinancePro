import { AccountsService } from './accounts.service';
import { Types } from 'mongoose';

describe('AccountsService', () => {
  let service: AccountsService;
  let model: any;
  let familiesService: any;

  beforeEach(() => {
    model = {
      create: jest.fn(async (data) => ({ _id: 'acc-1', ...data })),
      find: jest.fn(),
      findById: jest.fn(),
    };
    familiesService = {
      getCurrentFamily: jest.fn(async () => ({ family: { _id: 'fam-1' }, role: 'admin' })),
    };
    service = new AccountsService(model, familiesService);
  });

  it('cria conta pessoal usando o usuário como dono', async () => {
    const result = await service.createAccount('user-1' as any, {
      name: 'Carteira',
      type: 'cash',
      initialBalanceCents: 5000,
      ownerType: 'user',
    } as any);
    expect(result).toMatchObject({ ownerType: 'user', ownerId: 'user-1', name: 'Carteira' });
  });

  it('cria conta familiar usando a família atual como dona', async () => {
    const result = await service.createAccount('user-1' as any, {
      name: 'Reserva',
      type: 'savings',
      ownerType: 'family',
    } as any);
    expect(result).toMatchObject({ ownerType: 'family', ownerId: 'fam-1' });
  });

  it('listar contas retorna pessoais e familiares', async () => {
    const spy = jest.spyOn(model, 'find');
    await service.listUserAccounts('user-1' as any);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('proíbe acesso à conta familiar de outra família', async () => {
    familiesService.getCurrentFamily.mockResolvedValueOnce(null);
    model.findById.mockResolvedValueOnce({
      _id: 'acc-2',
      ownerType: 'family',
      ownerId: 'fam-other',
    });
    await expect(service.getAccountById('acc-2', 'user-1' as any)).rejects.toThrow();
  });

  it('atualiza nome e saldo de conta pessoal', async () => {
    const saveSpy = jest.fn();
    const validId = new Types.ObjectId().toString();
    model.findById.mockResolvedValueOnce({
      _id: validId,
      ownerType: 'user',
      ownerId: 'user-1',
      name: 'Antigo',
      save: saveSpy,
    });
    const result = await service.updateAccount(validId, 'user-1' as any, {
      name: 'Novo',
      initialBalanceCents: 10000,
    } as any);
    expect(result.name).toBe('Novo');
    expect(result.initialBalanceCents).toBe(10000);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('só admin da família pode excluir conta familiar', async () => {
    const validId = new Types.ObjectId().toString();
    const mockAccount = {
      _id: validId,
      ownerType: 'family',
      ownerId: 'fam-1',
      status: 'active',
      save: jest.fn(),
    };
    model.findById.mockResolvedValue(mockAccount);
    // 1ª chamada: getAccountById -> mock atual (admin)
    // 2ª chamada: deleteAccount -> mock atual (member)
    familiesService.getCurrentFamily
      .mockResolvedValueOnce({ family: { _id: 'fam-1' }, role: 'admin' })
      .mockResolvedValueOnce({ family: { _id: 'fam-1' }, role: 'member' });

    await expect(
      service.deleteAccount(validId, 'user-1' as any),
    ).rejects.toThrow(/administrador/i);
  });

  it('exclui conta pessoal (arquiva)', async () => {
    const saveSpy = jest.fn();
    const validId = new Types.ObjectId().toString();
    model.findById.mockResolvedValueOnce({
      _id: validId,
      ownerType: 'user',
      ownerId: 'user-1',
      status: 'active',
      save: saveSpy,
    });
    const result = await service.deleteAccount(validId, 'user-1' as any);
    expect(result.message).toBe('Conta excluída com sucesso');
    expect(saveSpy).toHaveBeenCalled();
  });
});