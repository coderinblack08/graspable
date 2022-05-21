import { DataSource } from "typeorm";
import { Member } from "./entities/Member";
import { Organization } from "./entities/Organization";
import { User } from "./entities/User";
import { Workspace } from "./entities/Workspace";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "graspable",
  synchronize: true,
  logging: true,
  entities: [User, Workspace, Organization, Member],
  subscribers: [],
  migrations: [],
});
