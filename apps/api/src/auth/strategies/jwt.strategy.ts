import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies && request.cookies['access_token']) {
            token = request.cookies['access_token'];
          }
          if (!token && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
              token = authHeader.substring(7);
            }
          }
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-default-key-change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: true,
            organization: true,
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    
    // We can compute the effective permissions here or let the guard do it
    // For simplicity, we attach the user and their roles to the request
    return user;
  }
}
