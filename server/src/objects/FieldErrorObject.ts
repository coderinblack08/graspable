import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class FieldErrorObject {
  @Field()
  field: string;

  @Field()
  message: string;
}
