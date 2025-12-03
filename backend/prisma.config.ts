export default defineConfig({
  migrations: {
    seed: 'bun ./prisma/seed.ts',
  },
  datasource: {
    url: 'postgresql://bitici_user:biticibot11478@localhost:5432/bitici_bot?schema=public',
  },
})