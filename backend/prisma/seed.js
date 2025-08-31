const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@paystreet.com' },
    update: {},
    create: {
      email: 'admin@paystreet.com',
      password: adminPassword,
      fullName: 'PayStreet Admin',
      accountNumber: 'ADMIN001',
      role: 'ADMIN'
    }
  });

  // Create sample user
  const userPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      fullName: 'John Doe',
      accountNumber: 'USER001'
    }
  });

  // Create sample beneficiaries
  const beneficiary1 = await prisma.beneficiary.create({
    data: {
      name: 'Jane Smith',
      bankAccountNumber: 'IN1234567890',
      country: 'India',
      currency: 'INR',
      userId: user.id
    }
  });

  const beneficiary2 = await prisma.beneficiary.create({
    data: {
      name: 'Carlos Rodriguez',
      bankAccountNumber: 'MX9876543210',
      country: 'Mexico',
      currency: 'MXN',
      userId: user.id
    }
  });

  // Create sample transactions
  const transaction1 = await prisma.transaction.create({
    data: {
      sourceAmount: 1000,
      sourceCurrency: 'USD',
      targetAmount: 82450,
      targetCurrency: 'INR',
      fxRate: 82.45,
      fees: 25,
      status: 'COMPLETED',
      isHighRisk: false,
      userId: user.id,
      beneficiaryId: beneficiary1.id
    }
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      sourceAmount: 500,
      sourceCurrency: 'USD',
      targetAmount: 8500,
      targetCurrency: 'MXN',
      fxRate: 17.0,
      fees: 15,
      status: 'COMPLETED',
      isHighRisk: false,
      userId: user.id,
      beneficiaryId: beneficiary2.id
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user created:', admin.email);
  console.log('👤 Sample user created:', user.email);
  console.log('👥 Sample beneficiaries created:', beneficiary1.name, beneficiary2.name);
  console.log('💰 Sample transactions created');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
