import { ObjectType, Field } from "type-graphql";
import { FieldErrorObject } from "./FieldErrorObject";
import { User } from "../../prisma/generated/type-graphql";

@ObjectType()
export class UserObject {
  @Field(() => [FieldErrorObject], { nullable: true })
  errors?: FieldErrorObject[];

  @Field(() => User, { nullable: true })
  user?: User;
}
