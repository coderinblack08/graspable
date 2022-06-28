import { Cell, Filter, Row, Sort } from "@prisma/client";
import { EventEmitter } from "events";

interface MyEvents {
  "cell.upsert": (cell: Cell) => void;
  "row.add": (row: Row) => void;
  "row.delete": (args: { ids: string[]; tableId: string }) => void;
  "sort.add": (sort: Sort) => void;
  "sort.update": (sort: Sort) => void;
  "sort.delete": (sort: Sort) => void;
  "filter.add": (filter: Filter) => void;
  "filter.update": (filter: Filter) => void;
  "filter.delete": (filter: Filter) => void;
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
