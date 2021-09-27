import { GraphQLScalarType, Kind } from "graphql";
import { Field, InputType, Int } from "type-graphql";

const StringOrInt = new GraphQLScalarType({
  name: "StringOrInt",
  description: "Scalar type union of String and Int",
  serialize(value: unknown): string | number {
    // check the type of received value
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error("StringOrInt can only serialize string or number values");
    }
    return value;
  },
  parseValue(value: unknown): string | number {
    // check the type of received value
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error("StringOrInt can only serialize string or number values");
    }
    return value;
  },
  parseLiteral(ast): string | number {
    // check the type of received value
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new Error("StringOrInt can only parse string or number values");
    }
    return ast.kind === Kind.INT ? parseInt(ast.value) : ast.value; // value from the client query
  },
});

@InputType()
export class PaginationInput {

  @Field(() => Int, { nullable: true })
  limit: number

  @Field(() => StringOrInt, { nullable: true })
  cursor: string | number

  @Field(() => String, { nullable: true })
  field: string

  @Field(() => String, { nullable: true, defaultValue: 'asc' })
  order: string = 'asc'
}