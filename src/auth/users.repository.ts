import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { genSalt, hash } from 'bcrypt';

interface IUsersRepository {
  createUser(authCredentialsDto: AuthCredentialsDto): Promise<void>;
}

@Injectable()
export class UsersRepository
  extends Repository<User>
  implements IUsersRepository
{
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt: string = await genSalt();
    const hashedPassword: string = await hash(password, salt);

    const user = this.create({ username, password: hashedPassword });

    try {
      await this.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        Logger.error(
          `Username "${username}" already exists`,
          UsersRepository.name,
        );
        throw new ConflictException(`Username "${username}" already exists`);
      }

      Logger.error(
        `Failed to create user "${username}"`,
        { error: JSON.stringify(error) },
        UsersRepository.name,
      );
      throw new InternalServerErrorException();
    }
  }
}
