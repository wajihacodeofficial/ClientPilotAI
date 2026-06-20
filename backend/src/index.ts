import dotenv from 'dotenv';
import { app, verifySupabaseConnection } from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await verifySupabaseConnection();
});

