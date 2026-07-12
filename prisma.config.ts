import * as dotenv from 'dotenv';
dotenv.config();

export default {
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
