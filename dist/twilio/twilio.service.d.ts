import { ConfigService } from '@nestjs/config';
export declare class TwilioService {
    private configService;
    private client;
    constructor(configService: ConfigService);
    sendWelcomeMessage(to: string, userName: string): Promise<void>;
    sendResetCode(to: string, code: string): Promise<void>;
}
