import { Module } from '@nestjs/common';
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
      provide: TasksRepository,
      useFactory: (dataSource: DataSource) => {
        return new TasksRepository(dataSource);
      },
      inject: [DataSource],
    },
    TasksService,
  ],
})
export class TasksModule {}
