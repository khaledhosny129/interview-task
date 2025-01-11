"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../user/schema/user.schema");
const twilio_service_1 = require("../twilio/twilio.service");
let AuthService = class AuthService {
    constructor(userModel, jwtService, twilioService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.twilioService = twilioService;
    }
    async validateUserCreds(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.BadRequestException('No user found with this email');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        return user;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.validateUserCreds(email, password);
        const payload = { email: user.email, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(registerDto) {
        const { name, email, password, phone } = registerDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const existingPhone = await this.userModel.findOne({ phone });
        if (existingPhone) {
            throw new common_1.BadRequestException('Phone number already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this.userModel({ name, email, password: hashedPassword, phone });
        const savedUser = await newUser.save();
        await this.twilioService.sendWelcomeMessage(savedUser.phone, savedUser.name);
        return savedUser;
    }
    async sendPasswordResetCode(phone) {
        const user = await this.userModel.findOne({ phone });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.resetCode = resetCode;
        user.resetCodeExpiresAt = expiresAt;
        await user.save();
        await this.twilioService.sendResetCode(user.phone, resetCode);
    }
    async resetPassword(email, code, newPassword) {
        const user = await this.userModel.findOne({ email });
        if (!user || user.resetCode !== code) {
            throw new common_1.BadRequestException('Invalid reset code');
        }
        if (user.resetCodeExpiresAt && user.resetCodeExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset code has expired');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = undefined;
        user.resetCodeExpiresAt = undefined;
        await user.save();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        twilio_service_1.TwilioService])
], AuthService);
//# sourceMappingURL=auth.service.js.map