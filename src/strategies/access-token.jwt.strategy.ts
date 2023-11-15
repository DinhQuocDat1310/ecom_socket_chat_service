import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadDTO } from 'src/messages/dto/payload-user';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(private readonly messageService: MessagesService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
    });
  }

  async validate(payload: PayloadDTO) {
    const user = await this.messageService.findUserByEmailOrPhoneNumber(
      payload.username,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
