import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'topSecret51',
      signOptions: {
        expiresIn: 3600,
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: UsersRepository,
      useFactory: (dataSource: DataSource) => {
        return new UsersRepository(dataSource);
      },
      inject: [DataSource],
    },
    AuthService,
    JwtStrategy,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
