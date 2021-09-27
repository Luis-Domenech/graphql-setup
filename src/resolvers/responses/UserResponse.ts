import { ObjectType, Field } from "type-graphql"
import { User } from "../../generated/type-graphql"
import { FieldError } from "../general/FieldError"

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}