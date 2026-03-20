if (!process.env.DATABASE_URL) {
  console.log('Skipping `prisma migrate deploy`: DATABASE_URL not set');
  process.exit(0);
}

const { spawnSync } = await import('node:child_process');
const { default: pg } = await import('pg');

async function markFailedMigrationsAsRolledBack() {
  try {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      "update _prisma_migrations set rolled_back_at = now() where finished_at is null and rolled_back_at is null"
    );
    if (result.rowCount > 0) {
      console.log(`Marked ${result.rowCount} failed migration(s) as rolled back.`);
    }
    await pool.end();
  } catch (error) {
    console.warn('Could not auto-resolve failed migrations:', error?.message || error);
  }
}

await markFailedMigrationsAsRolledBack();

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'migrate', 'deploy'],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);
