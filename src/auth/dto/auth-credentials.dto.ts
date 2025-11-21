import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MaxLength(20)
  @MinLength(4)
  username: string;

  @IsString()
  @MaxLength(32)
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password too weak. It must contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  password: string;
}
