import { Field, ObjectType, Int, Float } from "type-graphql";

@ObjectType()
export class Example {

  @Field(() => String!)
  type!: string

  // Optional
  @Field(() => Int)
  numberType?: number

  @Field(() => CustomObject!)
  myType!: CustomObject

}

@ObjectType()
class CustomObject {

  @Field(() => String!)
  a!: string

  @Field(() => Float!)
  b!: number

  // Optional
  @Field(() => String)
  c: string
}