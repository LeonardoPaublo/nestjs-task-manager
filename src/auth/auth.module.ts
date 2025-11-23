import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRES_IN') || '3600',
          ),
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(AuthController.name, { timestamp: true }),
    },
    {
      provide: UsersRepository,
      useFactory: (dataSource: DataSource, logger: Logger) => {
        return new UsersRepository(dataSource, logger);
      },
      inject: [DataSource, Logger],
    },
    AuthService,
    JwtStrategy,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
