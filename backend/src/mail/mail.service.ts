import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER as string, pass: process.env.EMAIL_PASS as string},
  });

  async sendWelcomeEmail(email: string, fullName: string) {
    try {
      await this.transporter.sendMail({
        from: `"LensLease VN" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Chào mừng bạn đến với LensLease VN 🎉',
        html: `<p>Xin chào ${fullName}, tài khoản của bạn đã được tạo thành công!</p>`,
      });
    } catch (error) {
      console.error('Lỗi gửi mail:', error);
    }
  }
}