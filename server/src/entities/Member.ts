import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

@Entity()
@ObjectType()
export class Member extends BaseEntity {
  @Field()
  @Column({ type: "enum", enum: MemberRole })
  role: MemberRole;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.members)
  organization: Organization;

  @ManyToOne(() => User)
  user: User;
}
