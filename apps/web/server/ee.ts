import { Cell, Row } from "@prisma/client";
import { EventEmitter } from "events";

interface MyEvents {
  "cell.upsert": (cell: Cell) => void;
  "row.add": (row: Row) => void;
  "row.delete": (args: { ids: string[]; tableId: string }) => void;
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
