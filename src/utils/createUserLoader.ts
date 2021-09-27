import { PrismaClient } from '@prisma/client'
import DataLoader from 'dataloader'
import { User } from '../generated/type-graphql'

export const createUserLoader = (prisma: PrismaClient) => new DataLoader<number, User>(async userIds => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds as number[]
      }
    }
  })

  const UserIdToUser: Record<number, User> = {}

  users.forEach(user => {
    UserIdToUser[user.id] = user
  })

  return userIds.map((userId) => UserIdToUser[userId])
})