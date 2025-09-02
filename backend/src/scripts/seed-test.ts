import 'reflect-metadata';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

import { DataSource } from 'typeorm';

const ds = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_DATABASE || ':memory:',
  entities: [Role, User],
  synchronize: true,
  logging: false,
});

async function main() {
  await ds.initialize();
  const rolesRepo = ds.getRepository(Role);
  const usersRepo = ds.getRepository(User);

  if (await rolesRepo.count() === 0) {
    await rolesRepo.save([{ name: 'Admin' }, { name: 'User' }, { name: 'PM' }]);
  }

  if (await usersRepo.count() === 0) {
    const allRoles = await rolesRepo.find();
    const admin = allRoles.find(r => r.name === 'Admin')!;
    const user  = allRoles.find(r => r.name === 'User')!;
    const pm    = allRoles.find(r => r.name === 'PM')!;
    await usersRepo.save([
      { email: 'alice@example.com', name: 'Alice Admin', roles: [admin] },
      { email: 'bob@example.com',   name: 'Bob User',   roles: [user]  },
      { email: 'pat@example.com',   name: 'Pat PM',     roles: [pm]    },
    ]);
  }
  await ds.destroy();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
