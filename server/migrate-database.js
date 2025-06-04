// migrate-database.js
// Comprehensive script to migrate the database to the latest schema.

import db from './db.js'; // db.js should now only contain CREATE TABLE IF NOT EXISTS statements

const createSlug = (title) => {
  if (!title || typeof title !== 'string') {
    // Fallback for null or non-string titles, perhaps generate a random or time-based slug
    return `blog-${Date.now()}`;
  }
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')         // replace spaces with hyphens
    .replace(/-+/g, '-')          // replace multiple hyphens with a single one
    .trim('-');                   // trim hyphens from start and end
};

async function runMigration() {
  console.log('Starting comprehensive database migration...');

  // Helper to add a column if it doesn't exist
  async function addColumnIfNotExists(tableName, columnName, columnType) {
    const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
    const columnExists = tableInfo.some(col => col.name === columnName);
    if (!columnExists) {
      console.log(`Adding column '${columnName}' (${columnType}) to table '${tableName}'...'`);
      try {
        await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
        console.log(`Column '${columnName}' added to '${tableName}'.`);
        return true; // Column was added
      } catch (e) {
        console.error(`Failed to add column '${columnName}' to '${tableName}':`, e.message);
        // If it's the non-constant default error, we might need to be even more careful
        if (e.message.includes('non-constant default')) {
            console.log(`Attempting to add '${columnName}' to '${tableName}' without default for ALTER.`);
            await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT`); // Add as TEXT, no default
            console.log(`Column '${columnName}' added as TEXT (no default in alter) to '${tableName}'. Backfill needed.`);
            return true;
        }
        return false; // Failed to add
      }
    } else {
      console.log(`Column '${columnName}' already exists in table '${tableName}'.`);
      return false; // Column already existed
    }
  }

  // Helper to backfill timestamp for a column if it's NULL
  async function backfillTimestamp(tableName, columnName) {
    console.log(`Backfilling NULLs in '${columnName}' for table '${tableName}' with CURRENT_TIMESTAMP...`);
    await db.run(`UPDATE ${tableName} SET ${columnName} = CURRENT_TIMESTAMP WHERE ${columnName} IS NULL`);
    console.log(`Backfill for '${columnName}' in '${tableName}' complete.`);
  }

  // --- Schema Definitions (target state, based on db.js CREATE TABLE statements) ---
  const targetSchemas = {
    users: [
      { name: 'createdAt', type: 'TEXT' } // In CREATE: NOT NULL DEFAULT (app handles or was CT)
    ],
    logos: [
      { name: 'date', type: 'TEXT' },
      { name: 'createdAt', type: 'TEXT', isTimestamp: true }, // In CREATE: NOT NULL DEFAULT CURRENT_TIMESTAMP
      { name: 'updatedAt', type: 'TEXT', isTimestamp: true }  // In CREATE: NOT NULL DEFAULT CURRENT_TIMESTAMP
    ],
    authors: [
      { name: 'avatarUrl', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' }, // Assuming bio might have been added later
      { name: 'createdAt', type: 'TEXT', isTimestamp: true },
      { name: 'updatedAt', type: 'TEXT', isTimestamp: true }
    ],
    tags: [
      { name: 'color', type: 'TEXT' }, // DEFAULT '#3B82F6' in CREATE
      { name: 'createdAt', type: 'TEXT', isTimestamp: true },
      { name: 'updatedAt', type: 'TEXT', isTimestamp: true }
    ],
    blogs: [
      { name: 'slug', type: 'TEXT' },
      { name: 'coverImage', type: 'TEXT' },
      { name: 'logoId', type: 'INTEGER' },
      { name: 'authorId', type: 'INTEGER' },
      { name: 'referenceArticles', type: 'TEXT' },
      { name: 'createdAt', type: 'TEXT', isTimestamp: true },
      { name: 'updatedAt', type: 'TEXT', isTimestamp: true }
    ],
    announcements: [
        { name: 'createdAt', type: 'TEXT', isTimestamp: true },
        // expiresAt is TEXT, no default CURRENT_TIMESTAMP in CREATE
    ],
    events: [
        { name: 'createdAt', type: 'TEXT', isTimestamp: true },
        { name: 'updatedAt', type: 'TEXT', isTimestamp: true }
    ],
    highlights: [
        { name: 'createdAt', type: 'TEXT', isTimestamp: true },
        { name: 'updatedAt', type: 'TEXT', isTimestamp: true }
    ]
    // blog_tags, event_items are mainly FKs, assume their structure is simple and covered by CREATE IF NOT EXISTS
  };

  for (const tableName in targetSchemas) {
    console.log(`\n--- Processing table: ${tableName} ---`);
    const tableExistsResult = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
    if (!tableExistsResult) {
        console.warn(`Table '${tableName}' does not exist. Skipping migration for this table. It should be created by initializeDb.`);
        continue;
    }

    for (const column of targetSchemas[tableName]) {
      // For timestamp columns, add as TEXT then backfill to avoid non-constant default issues in ALTER
      if (column.isTimestamp) {
        if (await addColumnIfNotExists(tableName, column.name, 'TEXT')) {
          await backfillTimestamp(tableName, column.name);
        }
      } else {
        await addColumnIfNotExists(tableName, column.name, column.type);
      }
    }
  }

  // --- Specific Data Migrations --- 

  // Slug generation for blogs
  console.log('\n--- Generating slugs for blogs --- ');
  const blogsWithoutSlugs = await db.all('SELECT id, title FROM blogs WHERE slug IS NULL OR slug = ""');
  if (blogsWithoutSlugs.length > 0) {
    console.log(`Found ${blogsWithoutSlugs.length} blog(s) without slugs. Generating...`);
    for (const blog of blogsWithoutSlugs) {
      if (!blog.title) {
        console.warn(`Blog ID ${blog.id} has no title. Skipping slug generation.`);
        continue;
      }
      let baseSlug = createSlug(blog.title);
      if (!baseSlug) { // Handle cases where createSlug might return empty for very odd titles
        baseSlug = `blog-${blog.id}`;
      }
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await db.get('SELECT id FROM blogs WHERE slug = ? AND id != ?', [uniqueSlug, blog.id]);
        if (!existing) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      await db.run('UPDATE blogs SET slug = ? WHERE id = ?', [uniqueSlug, blog.id]);
      console.log(`Updated blog ID ${blog.id} (title: "${blog.title}") with slug '${uniqueSlug}'.`);
    }
  } else {
    console.log('No blogs found requiring slug generation.');
  }
  console.log("Slug generation complete.");

  // Unique index for blogs.slug
  console.log('\n--- Ensuring unique index on blogs.slug --- ');
  try {
    await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)');
    console.log("Unique index 'idx_blogs_slug' on blogs.slug ensured.");
  } catch (error) {
    console.warn(`Warning: Could not create unique index on blogs.slug: ${error.message}. This might indicate pre-existing duplicate slugs that were not resolved by the script, or other SQLite issue.`);
  }

  console.log('\nComprehensive database migration script finished.');
}

runMigration()
  .then(() => console.log("Migration process completed successfully."))
  .catch(error => console.error("Migration process failed:", error))
  .finally(() => {
    if (db && db.close) {
      db.close().then(() => console.log("Database connection closed by migration script."));
    }
  }); 