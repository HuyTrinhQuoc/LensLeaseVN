import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Bắt buộc cho Supabase / CSDL Cloud
  synchronize: false,
  autoLoadEntities: true,
}));
