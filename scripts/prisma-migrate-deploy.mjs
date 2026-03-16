if (!process.env.DATABASE_URL) {
  console.log('Skipping `prisma migrate deploy`: DATABASE_URL not set');
  process.exit(0);
}

const { spawnSync } = await import('node:child_process');

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'migrate', 'deploy'],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);

