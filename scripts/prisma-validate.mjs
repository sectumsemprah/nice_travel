import { spawnSync } from 'node:child_process';

process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/nice_travel';

const result = spawnSync('npx', ['prisma', 'validate', '--schema', 'prisma/schema.prisma'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

process.exit(result.status ?? 1);

