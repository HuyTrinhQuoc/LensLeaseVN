import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cho phép Frontend (Cổng 5173) gọi API xuống Backend (Cổng 3000)
  app.enableCors({
    origin: 'http://localhost:5173', // Hoặc để '*' nếu muốn mở cho mọi cổng
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie/token
  });

  // Cấu hình Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('LensLeaseVN API')
    .setDescription('Tài liệu API chính thức cho dự án cho thuê máy ảnh LensLeaseVN. Dành cho team Frontend và Tester.')
    .setVersion('1.0')
    .addBearerAuth() // Chuẩn bị cho tính năng gửi JWT Token sau này
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
