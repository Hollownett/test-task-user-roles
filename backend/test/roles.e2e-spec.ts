import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { createTestApp } from './utils/create-test-app'
import { seedRoles } from './utils/seed'

describe('Roles (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
    await seedRoles(app, [
      { name: 'Admin' },
      { name: 'User' },
      { name: 'PM' },
    ])
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /roles returns all roles', async () => {
    const res = await request(app.getHttpServer()).get('/roles').expect(200)
    const names = res.body.map((r: any) => r.name).sort()
    expect(names).toEqual(['Admin', 'PM', 'User'])
  })
})
