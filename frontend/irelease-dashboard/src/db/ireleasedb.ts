import Dexie from "dexie";

export const db = new Dexie("ireleasedb");

db.version(1).stores({
  records: "id" // use your unique ID field here
});
