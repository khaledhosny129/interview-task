import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );
  }

// Send Welcome SMS
async sendWelcomeMessage(to: string, userName: string): Promise<void> {
  const body = `Welcome to our platform, ${userName}! We're glad to have you.`;
  await this.client.messages.create({
    body,
    to,
    from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
  });
}

// Send Reset Code SMS
async sendResetCode(to: string, code: string): Promise<void> {
  const body = `Your password reset code is: ${code}. It will expire shortly.`;
  await this.client.messages.create({
    body,
    to,
    from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
  });
}

}
