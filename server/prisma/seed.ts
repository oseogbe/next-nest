import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if any admin user exists
  const existingAdmin = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed...');
    return;
  }

  // Create default admin user
  const defaultEmail = process.env.ADMIN_EMAIL as string;
  const defaultPassword = process.env.ADMIN_PASSWORD as string;

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: defaultEmail,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log('✅ Default admin user created successfully!');
  console.log(`   Email: ${defaultEmail}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log('   ⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

