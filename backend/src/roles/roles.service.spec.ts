import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { RolesService } from './roles.service'
import { Role } from './entities/role.entity'

export class RoleRepositoryMock {
  find = jest.fn()
  findOne = jest.fn()
}

describe('RolesService', () => {
  let service: RolesService
  let repo: RoleRepositoryMock

  const rolesFixture: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'PM' },
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useClass: RoleRepositoryMock,
        },
      ],
    }).compile()

    service = module.get<RolesService>(RolesService)
    repo = (service as any).rolesRepository as RoleRepositoryMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return all roles', async () => {
      repo.find.mockResolvedValueOnce(rolesFixture)

      const result = await service.findAll()

      expect(repo.find).toHaveBeenCalledTimes(1)
      expect(repo.find).toHaveBeenCalledWith()
      expect(result).toEqual(rolesFixture)
    })

    it('should propagate repository error', async () => {
      repo.find.mockRejectedValueOnce(new Error('db error'))

      await expect(service.findAll()).rejects.toThrow('db error')
      expect(repo.find).toHaveBeenCalledTimes(1)
    })
  })

  describe('findOne', () => {
    it('should return role by id', async () => {
      const target = rolesFixture[0]
      repo.findOne.mockResolvedValueOnce(target)

      const result = await service.findOne(target.id)

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: target.id } })
      expect(result).toEqual(target)
    })

    it('should return null when not found', async () => {
      repo.findOne.mockResolvedValueOnce(null)

      const result = await service.findOne(999)

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 999 } })
      expect(result).toBeNull()
    })

    it('should propagate repository error', async () => {
      repo.findOne.mockRejectedValueOnce(new Error('boom'))

      await expect(service.findOne(1)).rejects.toThrow('boom')
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
    })
  })
})
