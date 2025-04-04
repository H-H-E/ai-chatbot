// Script to check admin user role
const { config } = require('dotenv');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

// Load environment variables
config({
  path: '.env.local',
});

async function checkAdminUser() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in .env.local');
  }

  // Connect to the database
  const client = postgres(process.env.POSTGRES_URL);
  const db = drizzle(client);

  const email = 'hussein@poiesis.education';

  try {
    // Find the user
    const result = await db.execute(
      `SELECT * FROM "User" WHERE "email" = '${email}'`,
    );

    if (result.length > 0) {
      const user = result[0];
      console.log('User found:');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role || 'None'}`);

      if (!user.role || user.role !== 'admin') {
        console.log('Setting role to admin...');
        await db.execute(
          `UPDATE "User" SET "role" = 'admin' WHERE "email" = '${email}'`,
        );
        console.log('User role updated to admin successfully.');
      } else {
        console.log('User already has admin role.');
      }
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed.');
  }
}

checkAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
