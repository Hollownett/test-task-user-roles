import { createConnection } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';

async function seed() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '1111',
    database: 'user_role_db',
    entities: [User, Role],
    synchronize: true,
  });

  const adminRole = connection.getRepository(Role).create({ name: 'Admin' });
  const editorRole = connection.getRepository(Role).create({ name: 'Editor' });
  const viewerRole = connection.getRepository(Role).create({ name: 'Viewer' });

  const savedRoles = await connection.getRepository(Role).save([adminRole, editorRole, viewerRole]);
  const [admin, editor, viewer] = savedRoles;

  const users: User[] = [];
  for (let i = 1; i <= 200; i++) {
    users.push(
      connection.getRepository(User).create({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        roles: [i % 3 === 0 ? admin : i % 3 === 1 ? editor : viewer],
      })
    );
  }

  await connection.getRepository(User).save(users);

  console.log('Seed data created successfully');
  process.exit(0);
}

seed().catch(error => {
  console.error('Error during seeding:', error);
  process.exit(1);
});