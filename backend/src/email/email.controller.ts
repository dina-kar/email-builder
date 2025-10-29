import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { EmailService } from './email.service';

class SendTestEmailDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

class SendEmailDto {
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsString()
  subject: string;

  @IsString()
  mjmlContent: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-test')
  async sendTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
    try {
      // Use provided recipients or default to the specified email addresses
      const recipients = sendTestEmailDto.recipients || [
        'theoldmanofgod@gmail.com',
        'dinakaranvijayakumar@outlook.com',
      ];

      const result = await this.emailService.sendTestEmail(recipients);
      return {
        message: 'Test email sent successfully',
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send test email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    try {
      const result = await this.emailService.sendTemplateEmail(
        sendEmailDto.recipients,
        sendEmailDto.subject,
        sendEmailDto.mjmlContent,
      );
      return {
        message: 'Email sent successfully',
        ...result,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to send email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('verify')
  async verifyConnection() {
    try {
      const isConnected = await this.emailService.verifyConnection();
      return {
        connected: isConnected,
        message: isConnected 
          ? 'Email server connection is working' 
          : 'Failed to connect to email server',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to verify email server connection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
