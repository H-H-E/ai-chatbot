// Script to create an admin user
const { config } = require('dotenv');
const postgres = require('postgres');
const { genSaltSync, hashSync } = require('bcrypt-ts');
const { drizzle } = require('drizzle-orm/postgres-js');
const { eq } = require('drizzle-orm');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
config({
  path: '.env.local',
});

async function createAdminUser() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in .env.local');
  }

  // Connect to the database
  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client);

  // Since we're using a CommonJS script to interact with an ESM project,
  // we'll use raw SQL queries instead of Drizzle's query builder
  const email = 'hussein@poiesis.education';

  try {
    // Check if the user exists
    const existingUsers = await db.execute(
      `SELECT * FROM "User" WHERE "email" = '${email}'`,
    );

    if (existingUsers.length > 0) {
      console.log(`User with email ${email} already exists.`);
      console.log('Setting role to admin...');

      // Update the user's role to admin
      await db.execute(
        `UPDATE "User" SET "role" = 'admin' WHERE "email" = '${email}'`,
      );

      console.log('User role updated to admin successfully.');
    } else {
      // Generate a password
      const password = 'Admin123!';
      const salt = genSaltSync(10);
      const hashedPassword = hashSync(password, salt);

      // Create the user with admin role
      await db.execute(
        `INSERT INTO "User" ("id", "email", "password", "role") 
         VALUES ('${uuidv4()}', '${email}', '${hashedPassword}', 'admin')`,
      );

      console.log(`Admin user created successfully with email: ${email}`);
      console.log(`Initial password is: ${password}`);
      console.log('Please change this password after first login!');
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed.');
  }
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating admin user:', error);
    process.exit(1);
  });
