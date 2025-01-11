import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../user/schema/user.schema';
import { TwilioService } from 'src/twilio/twilio.service';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    private readonly twilioService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, twilioService: TwilioService);
    validateUserCreds(email: string, password: string): Promise<UserDocument>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    register(registerDto: RegisterDto): Promise<UserDocument>;
    sendPasswordResetCode(phone: string): Promise<void>;
    resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}
