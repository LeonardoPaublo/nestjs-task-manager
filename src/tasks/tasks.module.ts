import { Logger, Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksRepository } from './tasks.repository';
import { Task } from './task.entity';
import { DataSource } from 'typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(TasksController.name, { timestamp: true }),
    },
    {
      provide: TasksRepository,
      useFactory: (dataSource: DataSource, logger: Logger) => {
        return new TasksRepository(dataSource, logger);
      },
      inject: [DataSource, Logger],
    },
    TasksService,
  ],
})
export class TasksModule {}
