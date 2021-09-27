import { ObjectType, Field } from "type-graphql"

@ObjectType()
export class RegularError {
  @Field()
  message: string
}