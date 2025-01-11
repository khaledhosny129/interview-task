import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserDocument } from '../user/schema/user.schema';
import { TwilioService } from 'src/twilio/twilio.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  // Validate user credentials
  async validateUserCreds(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('No user found with this email');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  // Login user and issue JWT
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUserCreds(email, password);

    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register a new user
  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const { name, email, password, phone } = registerDto;
  
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
  
    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) {
      throw new BadRequestException('Phone number already in use');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ name, email, password: hashedPassword, phone });
  
    const savedUser = await newUser.save();
    await this.twilioService.sendWelcomeMessage(savedUser.phone, savedUser.name);
  
    return savedUser;
  }  

  async sendPasswordResetCode(phone: string): Promise<void> {
    const user = await this.userModel.findOne({ phone });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
    user.resetCode = resetCode;
    user.resetCodeExpiresAt = expiresAt;
    await user.save();
  
    await this.twilioService.sendResetCode(user.phone, resetCode);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user || user.resetCode !== code) {
      throw new BadRequestException('Invalid reset code');
    }
  
    if (user.resetCodeExpiresAt && user.resetCodeExpiresAt < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }
  
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpiresAt = undefined;
    await user.save();
  }
  
}
