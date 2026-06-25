import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false

      const email = user.email
      if (!email) return false

      // Check if user exists by email
      const existingUser = await prisma.user.findUnique({ where: { email } })

      if (!existingUser) {
        // Create new user
        const username = user.name?.replace(/\s+/g, '').toLowerCase() || email.split('@')[0]
        const passwordHash = await bcrypt.hash(require('crypto').randomBytes(32).toString('hex'), 12)

        const newUser = await prisma.user.create({
          data: {
            email,
            username,
            passwordHash,
            avatar: user.image || null,
            kycStatus: 'PENDING',
          },
        })

        // Create default wallets
        await prisma.wallet.createMany({
          data: [
            { userId: newUser.id, currency: 'CNY', balance: 0 },
            { userId: newUser.id, currency: 'HKD', balance: 0 },
            { userId: newUser.id, currency: 'USD', balance: 0 },
          ],
        })
      }

      return true
    },

    async jwt({ token, account }) {
      if (account?.provider === 'google' && token.email) {
        const user = await prisma.user.findUnique({ where: { email: token.email } })
        if (user) {
          token.userId = user.id
          token.username = user.username
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.name = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
