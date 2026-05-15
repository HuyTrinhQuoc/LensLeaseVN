import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';
import { CartModule } from './modules/cart/cart.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CamerasModule,
    AuthModule,
    CartModule,
    BookingsModule,
    WalletModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, MailService],
  exports: [PrismaService]
})
export class AppModule {}
