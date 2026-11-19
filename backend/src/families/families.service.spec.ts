import { FamiliesService } from './families.service';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let familyModel: any;
  let memberModel: any;
  let invitationModel: any;
  let userModel: any;
  let mockFindOneResult: any;

  beforeEach(() => {
    mockFindOneResult = null;

    familyModel = {
      create: jest.fn(async (data) => ({ _id: 'family-1', ...data })),
    };

    // Mock correto para o fluxo Mongoose: findOne().populate()
    const populateMock = jest.fn(async () => mockFindOneResult);
    memberModel = {
      create: jest.fn(async (data) => ({ _id: 'member-1', ...data })),
      findOne: jest.fn(() => ({
        populate: populateMock,
      })),
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    invitationModel = {
      create: jest.fn(async (data) => ({ _id: 'inv-1', ...data })),
    };

    userModel = {
      findOne: jest.fn(async () => ({ _id: 'user-2', email: 'other@test.com' })),
    };

    service = new FamiliesService(familyModel, memberModel, invitationModel, userModel);
  });

  function setFindOneResult(result: any) {
    mockFindOneResult = result;
  }

  it('cria família e adiciona o criador como administrador ativo', async () => {
    const family = await service.createFamily('owner-id' as any, { name: 'Família Silva' } as any);
    expect(family.name).toBe('Família Silva');
    expect(familyModel.create).toHaveBeenCalledWith({
      name: 'Família Silva',
      ownerId: 'owner-id',
      status: 'active',
    });
    expect(memberModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: 'family-1',
        role: 'admin',
        status: 'active',
      }),
    );
  });

  it('não permite convidar sem família ativa', async () => {
    setFindOneResult(null);
    await expect(
      service.inviteMember('user-id' as any, { email: 'new@test.com' } as any),
    ).rejects.toThrow(expect.anything());
  });

  it('admin pode convidar usuário existente e adiciona diretamente', async () => {
    // Para este teste, vamos mockar o serviço de famílias diretamente
    const originalGetCurrentFamily = service.getCurrentFamily;

    // Simular que o admin está em uma família ativa
    (service as any).getCurrentFamily = jest.fn(async () => ({
      family: { _id: 'fam' },
      role: 'admin',
    }));

    // Simular que o usuário alvo existe
    userModel.findOne.mockResolvedValueOnce({ _id: 'user-2', email: 'other@test.com' });

    // Simular que a verificação de membro existente retorna null
    memberModel.findOne.mockResolvedValue(null);

    const result = await service.inviteMember('user-id' as any, { email: 'other@test.com' } as any);
    expect(memberModel.create).toHaveBeenCalled();
    expect(result).toMatchObject({ _id: 'member-1' });
  });

  it('cria convite pendente quando o usuário ainda não existe', async () => {
    setFindOneResult({
      _id: 'member-1',
      familyId: { _id: 'fam' },
      userId: 'user-id',
      role: 'admin',
      status: 'active',
    });
    userModel.findOne.mockResolvedValueOnce(null);

    const result = await service.inviteMember('user-id' as any, { email: 'new@test.com' } as any);
    expect(invitationModel.create).toHaveBeenCalled();
    expect(result._id).toBe('inv-1');
  });
});