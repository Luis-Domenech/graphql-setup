import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { User } from '../generated/type-graphql';
import { MyContext } from '../types';
import { sendEmail } from '../utils/sendEmail';
import { validateRegister } from '../utils/validateRegister';
import { LoginInput } from './inputs/LoginInput';
import { RegisterInput } from './inputs/RegisterInput';
import { UserResponse } from './responses/UserResponse';
const argon2 = require('argon2');

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() {req}: MyContext) {
    if (req.session.userId === user.id) {
      //OK to show current user's email
      return user.email
    }

    //User wants to see other person's email
    return ''
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { prisma, req, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Length must be greater than 2"
          }
        ]
      }
    } 

    const key = FORGOT_PASSWORD_PREFIX + token
    const userId = await redis.get(key)

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired"
          }
        ]
      }
    }

    try {
      const hashedPassword = await argon2.hash(newPassword);

      try {
      
        const user = await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { password: hashedPassword }
        })
  
        req.session.userId = user.id
  
        await redis.del(key)
  
        return { user }
      }
      catch (e) {
        return {
          errors: [
            {
              field: "token",
              message: "User no longer exists"
            }
          ]
        }
      }
    }
    catch(err) {
      return {
        errors: [
          {
            field: "N/A",
            message: "Problem encrypting password"
          }
        ]
      }
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { prisma, redis }: MyContext
  ) {
    const user = await prisma.user.findFirst({ where: { email } })

    if (!user) {
      return true
    }

    const token = v4()
    await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3)

    const html = `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">Reset Password</a>`

    sendEmail('luisfabiandomenech@gmail.com', email, 'Change Password', html)

    return true
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { prisma, req }: MyContext) {
    if (!req.session.userId) {
      return null
    }

    // return prisma.user.findOne({ where: { id: req.session.userId }, include: {posts: true, updoots: true} })
    return prisma.user.findFirst({ where: { id: req.session.userId }})
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: RegisterInput,
    @Ctx() { prisma, req }: MyContext): Promise<UserResponse> {

    const errors = validateRegister(options)
    if (errors) {
      return { errors }
    }

    try {
      const hashedPassword = await argon2.hash(options.password);

      try {
        const user = await prisma.user.create({ data: { username: options.username, password: hashedPassword, email: options.email } });
        
        //This will auto login user
        req.session.userId = user.id
  
        return { user }
      }
      catch (e) {
        if (e.code === 'P2002') {
          return {
            errors: [
              {
                field: "username",
                message: "User already exists"
              }
            ]
          }
        }
        else {
          return {
            errors: [
              {
                field: "",
                message: "Problem with database encountered"
              }
            ]
          }
        }
      }
    }
    catch(e) {
      return {
        errors: [
          {
            field: "N/A",
            message: "Problem encrypting password"
          }
        ]
      }
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: LoginInput,
    @Ctx() { prisma, req }: MyContext): Promise<UserResponse> {

    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length must be greater than 2"
          }
        ]
      }
    }
    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 2"
          }
        ]
      }
    }

    const user = await prisma.user.findFirst({ where: { username: options.username } })

    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: "Username doesn't exist"
        }]
      }
    }

    try {      
      if (await argon2.verify(user.password, options.password)) {
        req.session!.userId = user.id
        return { user } 
      }
      else {
        return {
          errors: [{
            field: 'username',
            message: "Invalid login credentials"
          }]
        }
      }
    }
    catch(err) {
      return {
        errors: [{
          field: 'N/A',
          message: "Problem veryfying password"
        }]
      }
    }
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(COOKIE_NAME)
      if (err) {
        console.log(err)
        resolve(false)
        return
      }
      resolve(true)
    }))
  }
}