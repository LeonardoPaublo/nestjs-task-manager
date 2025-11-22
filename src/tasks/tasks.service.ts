import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';

interface ITaskService {
  getTasks(filterDto: GetTasksFilterDto): Promise<Task[]>;
  getTaskById(id: string): Promise<Task>;
  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task>;
}

@Injectable()
export class TasksService implements ITaskService {
  constructor(private readonly taskRepository: TasksRepository) {}

  getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      Logger.error(`Task with ID "${id}" not found`, TasksService.name);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      Logger.error(`Task with ID "${id}" not found`, TasksService.name);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    await this.taskRepository.save({ ...task, status });
    return task;
  }
}
