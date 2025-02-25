
import Dexie from "dexie";

export const db = new Dexie("EdTechDB");
db.version(1).stores({ courses: "id,title,short_summary,full_summary,qa,faculty,level" });

export async function syncCourses(courses) {
  await db.courses.clear();
  await db.courses.bulkPut(courses);
}

