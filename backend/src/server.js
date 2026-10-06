import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';

validateEnv();

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`TripGenius API running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start TripGenius:', error.message);
  process.exit(1);
});
