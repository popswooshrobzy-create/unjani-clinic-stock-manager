import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, text, mysqlEnum, boolean, timestamp } from "drizzle-orm/mysql-core";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Define tables inline for seed script
const dispensaries = mysqlTable("dispensaries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["main_clinic", "pod_mobile"]).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  sortOrder: int("sortOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const categoriesData = [
  { name: "Antibiotics", sortOrder: 1 },
  { name: "Chronic Medication", sortOrder: 2 },
  { name: "Cough Medication", sortOrder: 3 },
  { name: "Creams, Lotions, Ointments and Gels", sortOrder: 4 },
  { name: "Ears, Nose and Throat Medication", sortOrder: 5 },
  { name: "Family Planning", sortOrder: 6 },
  { name: "Gastrointestinal Tract", sortOrder: 7 },
  { name: "Injections", sortOrder: 8 },
  { name: "Nebulizer Medications", sortOrder: 9 },
  { name: "Obstetrics and Gynecology", sortOrder: 10 },
  { name: "Pain Medication", sortOrder: 11 },
  { name: "Psychological Medication", sortOrder: 12 },
  { name: "Vacoliters", sortOrder: 13 },
  { name: "Vaccinations and Immunizations", sortOrder: 14 },
  { name: "Vitamins", sortOrder: 15 },
];

const dispensariesData = [
  {
    name: "Main Clinic Dispensary",
    type: "main_clinic",
    description: "Primary clinic location managing the main inventory of medications and supplies for daily operations.",
    isActive: true,
  },
  {
    name: "POD Mobile Clinic",
    type: "pod_mobile",
    description: "Mobile clinic dispensary with separate inventory management for outreach healthcare services.",
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding database...");

  // Insert dispensaries
  for (const disp of dispensariesData) {
    try {
      await db.insert(dispensaries).values(disp);
      console.log(`✓ Created dispensary: ${disp.name}`);
    } catch (error) {
      console.log(`  Dispensary ${disp.name} may already exist`);
    }
  }

  // Insert categories
  for (const cat of categoriesData) {
    try {
      await db.insert(categories).values(cat);
      console.log(`✓ Created category: ${cat.name}`);
    } catch (error) {
      console.log(`  Category ${cat.name} may already exist`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
