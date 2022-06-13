import * as functions from "firebase-functions";
import { LexoRank } from "lexorank";
import * as admin from "firebase-admin";

if (process.env.NODE_ENV === "development") {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
  process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
}

admin.initializeApp();
const firestore = admin.firestore();
// const auth = admin.auth();

export const createWorkspace = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const uid = context.auth?.uid;

  const batch = firestore.batch();
  const workspaceRef = firestore.collection("workspaces").doc();
  batch.set(workspaceRef, {
    ownerId: uid,
    name: data.name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.set(workspaceRef.collection("members").doc(uid), {
    role: "owner",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const tableRef = workspaceRef.collection("tables").doc();
  batch.set(tableRef, {
    name: "Tasks",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const DEFAULT_COLUMNS = [
    {
      name: "Task",
      type: "text",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      name: "Status",
      type: "dropdown",
      dropdownOptions: ["Todo", "In Progress", "Done"],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      name: "Due Date",
      type: "date",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  const columns = DEFAULT_COLUMNS.reduce(
    (
      acc: admin.firestore.DocumentReference<FirebaseFirestore.DocumentData>[],
      column
    ) => {
      acc.push(tableRef.collection("columns").doc());
      batch.set(acc.at(-1)!, column);
      return acc;
    },
    []
  );

  const rows = [];
  let previousRank: LexoRank | undefined;
  for (let i = 0; i < 4; i++) {
    rows.push(tableRef.collection("rows").doc());
    const rank = previousRank ? previousRank.genNext() : LexoRank.middle();
    batch.set(rows[i], {
      rank: rank.toString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    previousRank = rank;
  }

  for (const row of rows) {
    for (const col of columns) {
      batch.set(tableRef.collection("cells").doc(), {
        columnId: col.id,
        rowId: row.id,
        value: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();
});

export const createNewRow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const uid = context.auth?.uid;
  const { workspaceId, tableId, previousRank } = data;

  const workspaceRef = firestore.collection("workspaces").doc(workspaceId);
  const tableRef = workspaceRef.collection("tables").doc(tableId);
  const membershipRef = workspaceRef.collection("members").doc(uid);

  if (!(await membershipRef.get()).exists) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You are not a member of this workspace."
    );
  }

  const rowRef = tableRef.collection("rows").doc();
  await rowRef.set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    rank: previousRank
      ? LexoRank.parse(previousRank).genNext().toString()
      : LexoRank.middle().toString(),
  });

  const columnsRef = tableRef.collection("columns");
  const columns = await columnsRef.get();

  const cellsRef = tableRef.collection("cells");
  const batch = firestore.batch();
  columns.forEach((column) => {
    batch.set(cellsRef.doc(), {
      columnId: column.id,
      rowId: rowRef.id,
      value: null,
    });
  });

  await batch.commit();
});

export const createNewColumn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }

  const uid = context.auth?.uid;
  const { workspaceId, tableId, name, type, dropdownOptions } = data;

  const workspaceRef = firestore.collection("workspaces").doc(workspaceId);
  const tableRef = workspaceRef.collection("tables").doc(tableId);
  const membershipRef = workspaceRef.collection("members").doc(uid);

  if (!(await membershipRef.get()).exists) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You are not a member of this workspace."
    );
  }

  const batch = firestore.batch();

  const columnRef = tableRef.collection("columns").doc();
  batch.set(columnRef, {
    name,
    type,
    dropdownOptions: dropdownOptions || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const rowsRef = tableRef.collection("rows");
  const rows = await rowsRef.get();

  const cellsRef = tableRef.collection("cells");
  rows.forEach((row) => {
    batch.set(cellsRef.doc(), {
      columnId: columnRef.id,
      rowId: row.id,
      value: null,
    });
  });

  await batch.commit();
});
