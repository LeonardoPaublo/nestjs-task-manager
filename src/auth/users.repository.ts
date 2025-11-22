import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

interface IUsersRepository {
  createUser(authCredentialsDto: AuthCredentialsDto): Promise<void>;
}

@Injectable()
export class UsersRepository
  extends Repository<User>
  implements IUsersRepository
{
  constructor(
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {
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
        this.logger.error(
          `Username "${username}" already exists`,
          UsersRepository.name,
        );
        throw new ConflictException(`Username "${username}" already exists`);
      }

      this.logger.error(
        `Failed to create user "${username}"`,
        { error: JSON.stringify(error) },
        UsersRepository.name,
      );
      throw new InternalServerErrorException();
    }
  }
}
