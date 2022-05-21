import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Member } from "./Member";
import { User } from "./User";
import { Workspace } from "./Workspace";

@Entity()
@ObjectType()
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  @Field()
  name: string;

  @Field()
  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.organizations)
  owner: User;

  @OneToMany(() => Member, (member) => member.organization)
  members: Member[];

  @OneToMany(() => Workspace, (workspace) => workspace.organization)
  workspaces: Workspace[];

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
