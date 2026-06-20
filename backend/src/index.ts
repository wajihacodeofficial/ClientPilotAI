import dotenv from 'dotenv';
import { app, verifySupabaseConnection } from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT} (bound to 0.0.0.0)`);
  await verifySupabaseConnection();
});

