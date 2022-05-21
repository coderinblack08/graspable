import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "./Organization";

@Entity()
@ObjectType()
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  @Field()
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.workspaces)
  organization: Organization;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
