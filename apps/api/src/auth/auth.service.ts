import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    
    // Access token - short lived (15 minutes)
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    let refresh_token = null;
    
    // Refresh token - long lived (30 days)
    if (loginDto.keepMeSignedIn) {
      refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
      const salt = await bcrypt.genSalt(10);
      const hashedRefreshToken = await bcrypt.hash(refresh_token, salt);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken }
      });
    } else {
      // Clear any existing refresh token if they don't want to stay signed in
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null }
      });
    }

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // 1. Verify the JWT
      const payload = this.jwtService.verify(refreshToken);
      
      // 2. Find the user
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // 3. Verify the hash
      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // 4. Generate new tokens
      const newPayload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const new_refresh_token = this.jwtService.sign(newPayload, { expiresIn: '30d' });
      
      const salt = await bcrypt.genSalt(10);
      const hashedRefreshToken = await bcrypt.hash(new_refresh_token, salt);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken }
      });
      
      return { access_token, refresh_token: new_refresh_token };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    });
    
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Normally you might create an organization here or wait for them to do it.
    // Let's just create the user.
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }
}
