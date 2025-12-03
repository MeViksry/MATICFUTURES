import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bitci.com' },
    update: {},
    create: {
      email: 'admin@bitci.com',
      password: adminPassword,
      fullName: 'Admin BITCI',
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: 'YEARLY',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      portfolio: {
        create: {}
      },
      botSettings: {
        create: {}
      }
    }
  })

  console.log('Admin created:', admin.email)

  // Create Test User
  const userPassword = await bcrypt.hash('user123456', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@bitci.com' },
    update: {},
    create: {
      email: 'user@bitci.com',
      password: userPassword,
      fullName: 'Test User',
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        create: {
          plan: 'MONTHLY',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      portfolio: {
        create: {
          totalBalance: 10000,
          availableBalance: 10000
        }
      },
      botSettings: {
        create: {
          maxPositions: 5,
          defaultLeverage: 10,
          maxLeverage: 50,
          riskPerTrade: 2,
          stopLossPercent: 5,
          takeProfitPercent: 10
        }
      }
    }
  })

  console.log('Test user created:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })