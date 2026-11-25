import { initDb } from "./db.js";

async function run() {
  try {
    const client = await initDb();
    const complaints = await client.query("SELECT COUNT(*) as count FROM complaints");
    const users = await client.query("SELECT COUNT(*) as count FROM users");
    const alerts = await client.query("SELECT COUNT(*) as count FROM emergency_alerts");
    const services = await client.query("SELECT COUNT(*) as count FROM public_services");

    console.log("-----------------------------------------");
    console.log("Database initialized and verified:");
    console.log(`Users: ${users.rows[0].count}`);
    console.log(`Complaints: ${complaints.rows[0].count}`);
    console.log(`Emergency Alerts: ${alerts.rows[0].count}`);
    console.log(`Public Services: ${services.rows[0].count}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Seed execution failed:", err);
    process.exit(1);
  }
}

run();