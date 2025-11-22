import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';

interface ITaskService {
  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>;
  getTaskById(id: string, user: User): Promise<Task>;
  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task>;
  deleteTask(id: string, user: User): Promise<void>;
  updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task>;
}

@Injectable()
export class TasksService implements ITaskService {
  constructor(
    private readonly taskRepository: TasksRepository,
    private readonly logger: Logger,
  ) {}

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id, user } });
    if (!task) {
      this.logger.error(`Task with ID "${id}" not found`);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, user });
    if (result.affected === 0) {
      this.logger.error(`Task with ID "${id}" not found`);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    await this.taskRepository.save({ ...task, status });
    return task;
  }
}
