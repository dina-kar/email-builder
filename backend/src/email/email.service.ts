import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import mjml2html from 'mjml';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SERVER_HOST'),
      port: this.configService.get<number>('EMAIL_SERVER_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_SERVER_USER'),
        pass: this.configService.get<string>('EMAIL_SERVER_PASSWORD'),
      },
    });
  }

  async sendTestEmail(to: string | string[]): Promise<any> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: 'Test Email from Email Builder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Email Builder - Test Email</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #666;">
              This is a test email sent from the Email Builder application.
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #444; margin-top: 0;">Email Configuration Details</h2>
              <ul style="color: #666;">
                <li>From: ${this.configService.get<string>('EMAIL_FROM')}</li>
                <li>Server: ${this.configService.get<string>('EMAIL_SERVER_HOST')}</li>
                <li>Port: ${this.configService.get<string>('EMAIL_SERVER_PORT')}</li>
                <li>Sent at: ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              If you received this email, it means your email configuration is working correctly!
            </p>
          </div>
        `,
        text: `
Email Builder - Test Email

This is a test email sent from the Email Builder application.

Email Configuration Details:
- From: ${this.configService.get<string>('EMAIL_FROM')}
- Server: ${this.configService.get<string>('EMAIL_SERVER_HOST')}
- Port: ${this.configService.get<string>('EMAIL_SERVER_PORT')}
- Sent at: ${new Date().toLocaleString()}

If you received this email, it means your email configuration is working correctly!
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Test email sent: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        recipients: Array.isArray(to) ? to : [to],
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendTemplateEmail(to: string | string[], subject: string, mjmlContent: string): Promise<any> {
    try {
      // Compile MJML to HTML
      let htmlContent: string;
      
      // Check if content is MJML or already HTML
      const isMJML = mjmlContent.trim().toLowerCase().includes('<mjml') || 
                     mjmlContent.trim().toLowerCase().includes('<mj-');
      
      if (isMJML) {
        // Compile MJML to responsive HTML
        const result = mjml2html(mjmlContent, {
          validationLevel: 'soft', // Don't fail on warnings
          minify: false, // Keep readable for debugging
        });

        if (result.errors && result.errors.length > 0) {
          this.logger.warn(`MJML compilation warnings: ${JSON.stringify(result.errors)}`);
        }

        htmlContent = result.html;
        this.logger.log('MJML compiled to HTML successfully');
      } else {
        // Already HTML, use as-is
        htmlContent = mjmlContent;
        this.logger.log('Content is already HTML, sending as-is');
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Template email sent: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        recipients: Array.isArray(to) ? to : [to],
        compiled: isMJML,
      };
    } catch (error) {
      this.logger.error(`Failed to send template email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email server connection verified');
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify email server connection: ${error.message}`, error.stack);
      return false;
    }
  }
}
