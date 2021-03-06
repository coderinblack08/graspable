import {
  Cell,
  Column,
  Cursor,
  Filter,
  Form,
  FormField,
  Member,
  Row,
  Sort,
  Table,
  User,
} from "@prisma/client";
import { EventEmitter } from "events";

interface MyEvents {
  "cell.upsert": (cell: Cell) => void;
  "row.add": (row: Row) => void;
  "row.updateRank": (row: Row) => void;
  "row.delete": (args: { ids: string[]; tableId: string }) => void;
  "sort.add": (sort: Sort) => void;
  "sort.update": (sort: Sort) => void;
  "sort.delete": (sort: Sort) => void;
  "filter.add": (filter: Filter) => void;
  "filter.update": (filter: Filter) => void;
  "filter.delete": (filter: Filter) => void;
  "table.add": (table: Table) => void;
  "table.update": (table: Table) => void;
  "table.delete": (table: Table) => void;
  "column.add": (column: Column) => void;
  "column.update": (column: Column) => void;
  "column.delete": (column: Column) => void;
  "cursor.update": (cursor: Cursor & { user: User }) => void;
  "cursor.create": (cursor: Cursor & { user: User }) => void;
  "cursor.delete": (cursor: Cursor & { user?: User }) => void;
  "member.delete": (member: Member) => void;
  "form.create": (form: Form) => void;
  "form.update": (form: Form & { fields: FormField[] }) => void;
}

declare interface MyEventEmitter {
  on<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  once<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  emit<U extends keyof MyEvents>(
    event: U,
    ...args: Parameters<MyEvents[U]>
  ): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyEventEmitter extends EventEmitter {}

export const ee = new MyEventEmitter();
