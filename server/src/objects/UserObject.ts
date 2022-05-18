import { User } from "../entities/User";
import { ObjectType, Field } from "type-graphql";
import { FieldErrorObject } from "./FieldErrorObject";

@ObjectType()
export class UserObject {
  @Field(() => [FieldErrorObject], { nullable: true })
  errors?: FieldErrorObject[];

  @Field(() => User, { nullable: true })
  user?: User;
}
