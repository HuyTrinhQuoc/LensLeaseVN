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
import { ChatModule } from './modules/chat/chat.module';
import { AdminUserModule } from './admin-user/admin-user.module';

import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';

import { AdminFinanceModule } from './admin-finance/admin-finance.module';
import { AdminListingsModule } from './admin-listings/admin-listings.module';
import { HandoverModule } from './modules/handover/handover.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { EkycModule } from './modules/ekyc/ekyc.module';
import { OwnerApplicationsModule } from './modules/owner-applications/owner-applications.module';
import { AdminBookingModule } from './admin-booking/admin-booking.module';
import { AdminNotificationModule } from './admin-notification/admin-notification.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ReviewsModule } from './modules/reviews/reviews.module';


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
    ReviewsModule,
    ChatModule,
    AdminUserModule,

    AdminDashboardModule,

    AdminFinanceModule,
    AdminListingsModule,
    HandoverModule,
    PromotionsModule,
    EkycModule,
    OwnerApplicationsModule,
    AdminBookingModule,
    AdminNotificationModule,
    ScheduleModule,

  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, MailService],
  exports: [PrismaService]
})
export class AppModule {}
