import { FieldValue } from "firebase/firestore";

export interface Workspace {
  id: string;
  createdAt: FieldValue;
  name: string;
  ownerId: string;
}

export interface Table {
  id: string;
  name: string;
  createdAt: FieldValue;
}

export interface Cell {
  id: string;
  columnId: string;
  rowId: string;
  value: string;
  createdAt: FieldValue;
}

export interface Column {
  id: string;
  createdAt: FieldValue;
  dropdownOptions?: string[];
  name: string;
  type: "dropdown" | "text" | "date" | "number";
}

export interface Row {
  id: string;
  rank: string;
  createdAt: FieldValue;
}
