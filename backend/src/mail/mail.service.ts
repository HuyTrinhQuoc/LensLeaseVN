// import { Injectable } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

// @Injectable()
// export class MailService {
//   private transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: { user: process.env.EMAIL_USER as string, pass: process.env.EMAIL_PASS as string},
//   });

//   async sendWelcomeEmail(email: string, fullName: string) {
//     try {
//       await this.transporter.sendMail({
//         from: `"LensLease VN" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: 'Chào mừng bạn đến với LensLease VN 🎉',
//         html: `<p>Xin chào ${fullName}, tài khoản của bạn đã được tạo thành công!</p>`,
//       });
//     } catch (error) {
//       console.error('Lỗi gửi mail:', error);
//     }
//   }
// }



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

  // 🆕 Gửi email xác nhận đăng kí
  async sendVerificationEmail(email: string, fullName: string, verifyLink: string) {
    try {
      await this.transporter.sendMail({
        from: `"LensLease VN" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xác nhận email đăng kí - LensLease VN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a3fc7;">Xác nhận Email Đăng Kí</h2>
            <p>Xin chào ${fullName},</p>
            <p>Cảm ơn bạn đã đăng kí tài khoản LensLease VN. Vui lòng click vào link dưới đây để xác nhận email của bạn:</p>
            
            <div style="margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #1a3fc7; color: white; 
                        text-decoration: none; border-radius: 4px; font-weight: bold;">
                Xác Nhận Email
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Nếu link trên không hoạt động, vui lòng copy và paste URL dưới đây vào trình duyệt:
            </p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
              ${verifyLink}
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Link này sẽ hết hạn sau 24 giờ. Nếu bạn không thực hiện đăng kí này, vui lòng bỏ qua email này.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              © 2024 LensLease VN. All rights reserved.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Lỗi gửi mail xác nhận:', error);
      throw error;
    }
  }
}