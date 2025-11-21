import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    Logger.log('Signup request received', AuthController.name);
    const response = this.authService.signUp(authCredentialsDto);
    Logger.log('Signup request processed', AuthController.name);
    return response;
  }

  @Post('/signin')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<string> {
    Logger.log('Signin request received', AuthController.name);
    const response = this.authService.signIn(authCredentialsDto);
    Logger.log('Signin request processed', AuthController.name);
    return response;
  }
}
