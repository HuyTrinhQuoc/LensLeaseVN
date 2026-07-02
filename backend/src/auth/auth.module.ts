import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtGuard } from './strategies/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_key_cua_ban',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  // Gộp tất cả vào một mảng duy nhất
  providers: [
    AuthService, 
    PrismaService, 
    MailService, 
    GoogleStrategy, 
    JwtGuard,   
    JwtStrategy     
  ],
  exports: [JwtGuard, JwtModule,],
})
export class AuthModule {}