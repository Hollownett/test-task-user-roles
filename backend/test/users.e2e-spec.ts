import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './utils/create-test-app';
import { seedRoles, seedUsers } from './utils/seed';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Role } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let http: any;

  let createdUserId: number;
  let seededUserId: number;
  let userRoleId: number;

  beforeAll(async () => {
    app = await createTestApp();
    http = app.getHttpServer();
    ds = app.get<DataSource>(getDataSourceToken());

    await seedRoles(app, [{ name: 'USER' }, { name: 'ADMIN' }]);
    const userRole = await ds
      .getRepository(Role)
      .findOne({ where: { name: 'USER' } });
    userRoleId = userRole!.id;

    await seedUsers(app, [
      { email: 'seeded@example.com', name: 'Seeded User' },
    ]);

    const seeded = await ds.getRepository(User).findOne({
      where: { email: 'seeded@example.com' },
    });
    seededUserId = seeded!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users create user', async () => {
    const dto = { email: 'test@example.com', name: 'Test User' };

    const res = await request(http).post('/users').send(dto).expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      email: 'test@example.com',
      name: 'Test User',
    });

    createdUserId = res.body.id;
  });

  it('GET /users', async () => {
    const res = await request(http).get('/users').expect(200);
    const ids = res.body.map((u: User) => u.id);
    expect(ids).toEqual(expect.arrayContaining([seededUserId, createdUserId]));
    res.body.forEach((u: User) => expect(Array.isArray(u.roles)).toBe(true));
  });

  it('GET /users/:id  with roles', async () => {
    const res = await request(http).get(`/users/${seededUserId}`).expect(200);

    expect(res.body).toMatchObject({
      id: seededUserId,
      email: 'seeded@example.com',
      name: 'Seeded User',
    });
    expect(Array.isArray(res.body.roles)).toBe(true);
  });

  it('PATCH /users/:id/roles add role', async () => {
    const res = await request(http)
      .patch(`/users/${seededUserId}/roles`)
      .send({ roleIds: [userRoleId] })
      .expect(200);

    expect(res.body).toMatchObject({
      id: seededUserId,
      email: 'seeded@example.com',
      name: 'Seeded User',
    });
    const roleNames = res.body.roles.map((r: Role) => r.name).sort();
    expect(roleNames).toEqual(['USER']);
  });
});
