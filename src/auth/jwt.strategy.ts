import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from './users.repository';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    logger.log(`JWT_SECRET loaded: ${secret ? 'YES' : 'NO'}`);
    if (!secret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    this.logger.log(`Validating JWT payload for username: ${payload.username}`);
    const { username } = payload;
    const user = await this.usersRepository.findOneBy({ username });

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      throw new UnauthorizedException();
    }

    this.logger.log(`User validated successfully: ${username}`);
    return user;
  }
}
