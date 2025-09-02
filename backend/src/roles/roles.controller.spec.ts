import { Test, TestingModule } from '@nestjs/testing'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { Role } from './entities/role.entity'

describe('RolesController', () => {
  let controller: RolesController
  let service: { findAll: jest.Mock }

  const rolesFixture: Role[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'PM' },
  ]

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue(rolesFixture),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: service },
      ],
    }).compile()

    controller = module.get<RolesController>(RolesController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('GET /roles', async () => {
    const res = await controller.findAll()

    expect(service.findAll).toHaveBeenCalledTimes(1)
    expect(res).toEqual(rolesFixture)
  })
})
