import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'password123';
  
  // 1. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 2. Create User
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  // 3. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
    },
  });

  // 4. Create Main Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'HQ Branch',
      organizationId: org.id,
    }
  });

  // 5. Create Admin Role
  const role = await prisma.role.create({
    data: {
      name: 'Admin',
      permissions: ['*'], // Has all permissions
    }
  });

  // 6. Assign User to Role in the Organization
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
      organizationId: org.id,
      branchId: branch.id,
    }
  });

  console.log('Database seeded successfully!');
  console.log('---------------------------------');
  console.log(`Login Email: ${email}`);
  console.log(`Login Password: ${password}`);
  console.log('---------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
