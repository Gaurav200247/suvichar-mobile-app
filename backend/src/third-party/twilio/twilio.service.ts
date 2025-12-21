import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      if (!this.client) {
        console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
        return true;
      }

      await this.client.messages.create({
        body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
        from: this.fromNumber,
        to: phoneNumber,
      });

      console.log(`OTP sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

