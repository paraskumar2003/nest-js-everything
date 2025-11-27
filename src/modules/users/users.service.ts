import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, MongoUserDocument } from './schema/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailOtpDto } from './dto/otp/verify-email-otp.dto';
import { Otp, OtpStatus } from './schema/otp.schema';
import axios from 'axios';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly mongoUserModel: Model<MongoUserDocument>,
        @InjectModel(Otp.name)
        private readonly otpModel: Model<Otp>,
        private readonly configService: ConfigService,
    ) {}

    private async sendOtpEmail(email: string, otp: number): Promise<void> {
        const apiUrl = 'https://communicationapi2.almond.solutions/api/mail';

        // ✅ Beautiful HTML email content
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
              
              <h2 style="color: #333;">🔐 Your OTP Code</h2>
              <p style="color: #555; font-size: 16px;">
                Use the following <strong>One-Time Password (OTP)</strong> to complete your verification:
              </p>
              
              <div style="margin: 25px 0;">
                <span style="display: inline-block; background: #4CAF50; color: #fff; font-size: 28px; letter-spacing: 6px; padding: 15px 30px; border-radius: 8px; font-weight: bold;">
                  ${otp}
                </span>
              </div>
    
              <p style="color: #777; font-size: 14px;">
                This code is valid for <strong>5 minutes</strong>. Please do not share it with anyone.
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
              <p style="color: #999; font-size: 12px;">
                If you didn’t request this OTP, you can safely ignore this email.
              </p>
            </div>
          </div>
        `;

        try {
            await axios.post(apiUrl, {
                mailName: 'OTP Verification',
                mailSubject: 'Your OTP Code',
                from: 'noreply@almonds.ai',
                to: [email],
                htmlContent,
                attachments: [],
            });

            console.log(`✅ OTP email sent to ${email}`);
        } catch (error: any) {
            console.error('❌ Failed to send OTP email:', error.message);
            throw new Error('Unable to send OTP email. Please try again.');
        }
    }

    async registerUser(data: RegisterUserDto): Promise<{ otp_sent: boolean }> {
        const { name, mobile, email } = data;

        // Check if user already exists (by mobile or email)
        let user = await this.mongoUserModel.findOne({
            $or: [{ email }, { mobile }],
        });

        if (!user) {
            // Hash password and create new user
            const hashedPassword = await bcrypt.hash('9876543210', 10);
            user = new this.mongoUserModel({
                name,
                mobile,
                email,
                password: hashedPassword,
                roles: [UserRole.USER],
            });
            await user.save();
        }

        // ------------------------------
        // 2. Generate OTP
        // ------------------------------
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database if not sent already in last 5 minutes
        const lastOtp = await this.otpModel.findOne({
            email,
            active: true,
        });

        if (lastOtp) {
            const lastSentAt = new Date(lastOtp.created_at).getTime();
            const FIVE_MIN = 5 * 60 * 1000;

            if (Date.now() - lastSentAt < FIVE_MIN) {
                throw new ForbiddenException(
                    'OTP already sent in last 5 minutes',
                );
            }
        }

        await this.otpModel.create({
            email,
            otp: otpCode,
            active: true,
        });

        await this.sendOtpEmail(email, Number(otpCode));

        return {
            otp_sent: true,
        };
    }

    async verifyOtp(
        data: VerifyEmailOtpDto,
    ): Promise<{ access_token: string; otp_verified: boolean }> {
        const { email, otp } = data;

        // ------------------------------
        // 1. Find OTP for this mobile
        // ------------------------------
        const otpRecord = await this.otpModel.findOne({
            email,
            active: true,
            status: 'pending',
        });

        if (!otpRecord) {
            throw new ForbiddenException('OTP not found or expired');
        }

        // ------------------------------
        // 2. Validate OTP
        // ------------------------------
        if (otpRecord.otp !== otp) {
            throw new BadRequestException('Invalid OTP');
        }

        // OPTIONAL: if OTP should expire in 5 minutes
        const createdAt = new Date(otpRecord.created_at).getTime();
        const FIVE_MIN = 5 * 60 * 1000;

        if (Date.now() - createdAt > FIVE_MIN) {
            otpRecord.status = OtpStatus.EXPIRED;
            otpRecord.active = false;
            await otpRecord.save();
            throw new ForbiddenException('OTP expired');
        }

        // ------------------------------
        // 3. Mark OTP as verified
        // ------------------------------
        otpRecord.status = OtpStatus.VERIFIED;
        otpRecord.active = false;
        await otpRecord.save();

        // ------------------------------
        // 4. Get or Create User
        // ------------------------------
        let user = await this.mongoUserModel.findOne({ email });

        if (!user) {
            throw new InternalServerErrorException('User not found');
        }

        // ------------------------------
        // 5. Generate JWT Token
        // ------------------------------
        const secret = this.configService.get('JWT_SECRET', 'default_secret');

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                mobile: user.mobile,
                roles: user.roles,
            },
            secret,
            { expiresIn: '1h' },
        );

        return {
            access_token: token,
            otp_verified: true,
        };
    }
}
