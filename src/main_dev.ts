import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-simple.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS aberto para desenvolvimento
  app.enableCors();
  
  console.log('🚀 Servidor iniciado na porta 3000!');
  console.log('📁 Endpoint de áudio: POST http://localhost:3000/audio/upload');
  console.log('🔓 CORS aberto para desenvolvimento');
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();