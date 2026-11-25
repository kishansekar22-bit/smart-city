import { Pool } from "pg";
import { newDb, IMemoryDb } from "pg-mem";
import fs from "fs";
import path from "path";
import { config } from "../config/index.js";
import {
  seedRoles,
  seedDepartments,
  seedUsers,
  seedComplaints,
  seedAlerts,
  seedAnnouncements,
  seedPublicServices,
  seedFeedback,
} from "./seedData.js";

export interface DbClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number | null }>;
  isMem: boolean;
}

let dbInstance: DbClient | null = null;

async function seedDatabase(client: DbClient) {
  const userCheck = await client.query("SELECT COUNT(*) as count FROM users");
  const count = parseInt(userCheck.rows[0]?.count || "0", 10);
  if (count > 0) {
    console.log(`[DB Seed] Database already contains ${count} users. Skipping seed.`);
    return;
  }

  console.log("[DB Seed] Seeding initial smart city records...");

  // Seed Roles
  for (const r of seedRoles) {
    await client.query(
      "INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [r.id, r.name, r.description]
    );
  }

  // Seed Departments
  for (const d of seedDepartments) {
    await client.query(
      "INSERT INTO departments (id, name, code, description, contact_email, contact_phone) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING",
      [d.id, d.name, d.code, d.description, d.contact_email, d.contact_phone]
    );
  }

  // Seed Users
  for (const u of seedUsers) {
    await client.query(
      "INSERT INTO users (id, full_name, email, phone, password_hash, role_id, department_id, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING",
      [u.id, u.full_name, u.email, u.phone, u.password_hash, u.role_id, u.department_id, u.avatar_url]
    );
  }

  // Seed Complaints
  for (const c of seedComplaints) {
    await client.query(
      `INSERT INTO complaints 
        (id, ticket_id, citizen_id, department_id, title, category, description, priority, status, latitude, longitude, address, landmark, resolution_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO NOTHING`,
      [
        c.id,
        c.ticket_id,
        c.citizen_id,
        c.department_id,
        c.title,
        c.category,
        c.description,
        c.priority,
        c.status,
        c.latitude,
        c.longitude,
        c.address,
        c.landmark,
        c.resolution_notes,
        c.created_at,
        c.updated_at,
      ]
    );

    // Seed Complaint Image
    if (c.image_url) {
      await client.query(
        `INSERT INTO complaint_images (id, complaint_id, image_url, file_name, file_size, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [`img-${c.id}`, c.id, c.image_url, `${c.ticket_id}.jpg`, 102400, c.created_at]
      );
    }

    // Seed initial Status History
    await client.query(
      `INSERT INTO complaint_status_history (id, complaint_id, changed_by, status, note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [`hist-${c.id}-1`, c.id, c.citizen_id, "Submitted", "Issue registered by citizen", c.created_at]
    );

    if (c.status !== "Submitted") {
      await client.query(
        `INSERT INTO complaint_status_history (id, complaint_id, changed_by, status, note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [`hist-${c.id}-2`, c.id, "usr-off-01", c.status, c.resolution_notes || `Status updated to ${c.status}`, c.updated_at]
      );
    }

    // Seed initial comment
    if (c.status === "In Progress" || c.status === "Resolved") {
      await client.query(
        `INSERT INTO complaint_comments (id, complaint_id, user_id, comment, is_internal, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [`comm-${c.id}-1`, c.id, "usr-off-01", `Field inspection scheduled. Updates will follow.`, false, c.updated_at]
      );
    }
  }

  // Seed Emergency Alerts
  for (const a of seedAlerts) {
    await client.query(
      `INSERT INTO emergency_alerts (id, title, description, severity, area, is_active, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
      [a.id, a.title, a.description, a.severity, a.area, a.is_active, a.created_by, a.created_at]
    );
  }

  // Seed Announcements
  for (const an of seedAnnouncements) {
    await client.query(
      `INSERT INTO announcements (id, title, category, content, is_pinned, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [an.id, an.title, an.category, an.content, an.is_pinned, an.image_url, an.created_at]
    );
  }

  // Seed Public Services
  for (const s of seedPublicServices) {
    await client.query(
      `INSERT INTO public_services (id, name, category, address, phone, email, opening_hours, latitude, longitude, department_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
      [s.id, s.name, s.category, s.address, s.phone, s.email, s.opening_hours, s.latitude, s.longitude, s.department_id]
    );
  }

  // Seed Feedback
  for (const f of seedFeedback) {
    await client.query(
      `INSERT INTO feedback (id, complaint_id, user_id, rating, comments, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [f.id, f.complaint_id, f.user_id, f.rating, f.comments, f.created_at]
    );
  }

  console.log("[DB Seed] Seeding completed successfully!");
}

export async function initDb(): Promise<DbClient> {
  if (dbInstance) return dbInstance;

  const schemaPath = path.join(process.cwd(), "src/db/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  // Attempt real PostgreSQL pool connection first
  let isPostgresConnected = false;
  try {
    const pgPool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 1500,
    });
    
    // Test query
    const res = await pgPool.query("SELECT 1 as test");
    if (res && res.rows) {
      console.log(`[Database] Successfully connected to live PostgreSQL server at ${config.databaseUrl}`);
      // Execute schema migrations
      await pgPool.query(schemaSql);
      
      const client: DbClient = {
        query: async (text: string, params?: any[]) => {
          const r = await pgPool.query(text, params);
          return {
            rows: r.rows,
            rowCount: r.rowCount,
          };
        },
        isMem: false,
      };
      dbInstance = client;
      isPostgresConnected = true;
      await seedDatabase(client);
      return client;
    }
  } catch (err: any) {
    console.log(`[Database] PostgreSQL connection failed (${err.message}).`);
  }

  if (!isPostgresConnected) {
    console.log("[Database] Initializing embedded PostgreSQL engine (pg-mem) for instant zero-dependency execution...");
    const memDb: IMemoryDb = newDb();
    
    memDb.public.none(schemaSql);
    const memAdapter = memDb.adapters.createPg();
    const memPool = new memAdapter.Pool();

    const client: DbClient = {
      query: async (text: string, params?: any[]) => {
        const res = await memPool.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rowCount !== undefined ? res.rowCount : (res.rows ? res.rows.length : 0),
        };
      },
      isMem: true,
    };

    dbInstance = client;
    await seedDatabase(client);
    console.log("[Database] Embedded PostgreSQL initialized and seeded successfully.");
    return client;
  }

  throw new Error("Could not initialize database");
}

export const db = {
  query: async (text: string, params?: any[]) => {
    if (!dbInstance) {
      await initDb();
    }
    return dbInstance!.query(text, params);
  },
};