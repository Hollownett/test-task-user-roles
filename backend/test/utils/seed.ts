import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../../src/roles/entities/role.entity';
import { User } from '../../src/users/entities/user.entity';

export async function seedRoles(
  app: INestApplication,
  roles: Array<Partial<Role>>,
) {
  const ds = app.get<DataSource>(getDataSourceToken());
  await ds.getRepository(Role).save(roles);
}

export async function seedUsers(
  app: INestApplication,
  users: Array<Partial<User>>,
) {
  const ds = app.get<DataSource>(getDataSourceToken());
  await ds.getRepository(User).save(users);
}
