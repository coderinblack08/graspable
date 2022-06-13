import * as functions from "firebase-functions";
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
  for (let i = 0; i < 4; i++) {
    rows.push(tableRef.collection("rows").doc());
    batch.set(rows[i], {
      previousId: i == 0 ? null : rows[i - 1].id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
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
