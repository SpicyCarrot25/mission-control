// Database seed script - Phase 2 clean slate

import { getDb, closeDb } from './index';

async function seed() {
  console.log('🌱 Seeding database (Phase 2 clean slate)...');

  const db = getDb();
  const now = new Date().toISOString();

  // Clear all data for a clean slate
  db.exec(`
    DELETE FROM task_deliverables;
    DELETE FROM task_activities;
    DELETE FROM planning_questions;
    DELETE FROM planning_specs;
    DELETE FROM openclaw_sessions;
    DELETE FROM messages;
    DELETE FROM conversation_participants;
    DELETE FROM conversations;
    DELETE FROM events;
    DELETE FROM tasks;
    DELETE FROM agents;
    DELETE FROM workspaces;
    DELETE FROM businesses;
  `);

  // Create default business
  db.prepare(
    `INSERT INTO businesses (id, name, description, created_at)
     VALUES (?, ?, ?, ?)`
  ).run('default', 'Mission Control HQ', 'Default business', now);

  // Create single workspace: General
  db.prepare(
    `INSERT INTO workspaces (id, name, slug, description, icon, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run('default', 'General', 'general', 'Primary workspace', '🧭', now, now);

  console.log('✅ Database seeded successfully!');
  console.log('   - Created workspace: General');

  closeDb();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
});
