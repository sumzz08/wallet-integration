import { createPool, sql } from '@vercel/postgres';
import { POSTGRES_URL } from '$env/static/private';

export async function load() {
  const db = createPool({ connectionString: POSTGRES_URL });

  try {
    const { rows: names } = await db.query('SELECT * FROM names');
    return {
      names: names,
    };
  } catch (error) {
    console.log(
      'Table does not exist, creating and seeding it with dummy data now...'
    );
    await seed();
    const { rows: names } = await db.query('SELECT * FROM names');
    return {
      names: names,
    };
  }
}

async function seed() {
  const db = createPool({ connectionString: POSTGRES_URL });
  const client = await db.connect();

  try {
    const createTable = await client.sql`CREATE TABLE IF NOT EXISTS names (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`;

    console.log('Created "names" table');

    const users = await Promise.all([
      client.sql`
            INSERT INTO names (name, email)
            VALUES ('Rohan', 'rohan@tcl.com')
            ON CONFLICT (email) DO NOTHING;`,
      client.sql`
            INSERT INTO names (name, email)
            VALUES ('Rebecca', 'rebecca@tcl.com')
            ON CONFLICT (email) DO NOTHING;`,
      client.sql`
            INSERT INTO names (name, email)
            VALUES ('Vivek', 'vivek@gmail.com')
            ON CONFLICT (email) DO NOTHING;`,
    ]);
    console.log(`Seeded ${users.length} users`);
  } finally {
    client.release(); // Release the client back to the pool
  }
}

export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const db = createPool({ connectionString: POSTGRES_URL });
    const client = await db.connect();

    try {
      const id = data.get('id');
      await client.sql`
        DELETE FROM names
        WHERE id = ${id};`;

      return { success: true };
    } finally {
      client.release(); // Release the client back to the pool
    }
  },

  create: async ({ request }) => {
    const data = await request.formData();
    const db = createPool({ connectionString: POSTGRES_URL });
    const client = await db.connect();

    try {
      const email = data.get('email');
      const name = data.get('name');

      await client.sql`
        INSERT INTO names (name, email)
        VALUES (${name}, ${email})
        ON CONFLICT (email) DO NOTHING;`;

      return { success: true };
    } finally {
      client.release(); // Release the client back to the pool
    }
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const db = createPool({ connectionString: POSTGRES_URL });
    const client = await db.connect();

    try {
      const email = data.get('email');
      const name = data.get('name');

      await client.sql`
        UPDATE names
        SET email = ${email}
        WHERE name = ${name};`;

      return { success: true };
    } finally {
      client.release(); // Release the client back to the pool
    }
  },
};
