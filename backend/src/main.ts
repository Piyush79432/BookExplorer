import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CRITICAL: Enable CORS ---
  // This allows your Next.js frontend (running on port 3000) 
  // to fetch data from this backend (running on port 3001).
   app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://book-explorer-sooty.vercel.app',   // No trailing slash
      'https://book-explorer-sooty.vercel.app/',  // With trailing slash
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'ngrok-skip-browser-warning', // 👈 REQUIRED for ngrok
    'Bypass-Tunnel-Reminder'
  ],
  });

  // --- Listen on Port 3001 ---
  // We use 3001 because Next.js usually takes 3000
  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
