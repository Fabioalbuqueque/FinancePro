import { AccountsService } from './accounts.service';

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
});