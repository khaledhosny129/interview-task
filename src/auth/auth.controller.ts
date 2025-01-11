import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('request-reset')
async requestPasswordReset(@Body('phone') phone: string) {
  await this.authService.sendPasswordResetCode(phone);
  return { message: 'Password reset code sent via SMS' };
}

@Post('reset-password')
async resetPassword(
  @Body('email') email: string,
  @Body('code') code: string,
  @Body('newPassword') newPassword: string,
) {
  await this.authService.resetPassword(email, code, newPassword);
  return { message: 'Password has been reset successfully' };
}

}
