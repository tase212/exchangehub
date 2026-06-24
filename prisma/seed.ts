import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('开始填充测试数据...')

  const passwordHash = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.create({
    data: {
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash,
      kycStatus: 'VERIFIED',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash,
      kycStatus: 'VERIFIED',
    },
  })

  await prisma.wallet.createMany({
    data: [
      { userId: user1.id, currency: 'CNY', balance: 50000 },
      { userId: user1.id, currency: 'HKD', balance: 0 },
      { userId: user2.id, currency: 'HKD', balance: 100000 },
      { userId: user2.id, currency: 'CNY', balance: 0 },
    ],
  })

  await prisma.order.createMany({
    data: [
      {
        sellerId: user1.id,
        sellCurrency: 'CNY',
        sellAmount: 10000,
        buyCurrency: 'HKD',
        buyAmount: 10800,
        rate: 1.08,
        method: 'OFFLINE_CASH',
        location: '香港中环找换店',
        status: 'OPEN',
      },
      {
        sellerId: user2.id,
        sellCurrency: 'HKD',
        sellAmount: 50000,
        buyCurrency: 'CNY',
        buyAmount: 46300,
        rate: 0.926,
        method: 'ONLINE_CARD',
        status: 'OPEN',
      },
      {
        sellerId: user1.id,
        sellCurrency: 'CNY',
        sellAmount: 5000,
        buyCurrency: 'USD',
        buyAmount: 690,
        rate: 0.138,
        method: 'QR_PAY',
        status: 'OPEN',
      },
    ],
  })

  await prisma.exchangeShop.createMany({
    data: [
      {
        name: '环球找换店（中环店）',
        address: '皇后大道中88号',
        city: '香港',
        country: '中国',
        phone: '+852-2123-4567',
        currencies: 'CNY,HKD,USD,EUR',
        rating: 4.8,
        reviewCount: 256,
      },
      {
        name: '环球找换店（旺角店）',
        address: '弥敦道168号',
        city: '香港',
        country: '中国',
        phone: '+852-2345-6789',
        currencies: 'CNY,HKD,JPY,KRW',
        rating: 4.6,
        reviewCount: 189,
      },
      {
        name: '上海钱币兑换',
        address: '南京东路100号',
        city: '上海',
        country: '中国',
        phone: '+86-21-1234-5678',
        currencies: 'CNY,HKD,USD,EUR,JPY',
        rating: 4.5,
        reviewCount: 312,
      },
    ],
  })

  console.log('测试数据填充完成！')
  console.log('测试账号:')
  console.log('  test1@example.com / password123')
  console.log('  test2@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
