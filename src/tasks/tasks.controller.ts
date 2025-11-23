import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskByIdDto } from './dto/get-task-by-id.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.log(`Getting all tasks for user ${user.username}`, {
      filter: filterDto,
    });
    const response = await this.tasksService.getTasks(filterDto, user);
    this.logger.log(`Found ${response.length} tasks for user ${user.username}`);
    return response;
  }

  @Get('/:id')
  async getTaskById(
    @Param() getTaskByIdDto: GetTaskByIdDto,
    @GetUser() user: User,
  ): Promise<Task> {
    const { id } = getTaskByIdDto;
    this.logger.log(`Getting task with ID ${id} for user ${user.username}`);
    const response = await this.tasksService.getTaskById(id, user);
    this.logger.log(`Retrieved task with ID ${id} for user ${user.username}`);
    return response;
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.log(`Creating a new task for user ${user.username}`);
    const response = await this.tasksService.createTask(createTaskDto, user);
    this.logger.log(`Created task with ID ${response.id}`);
    return response;
  }

  @Delete('/:id')
  async deleteTask(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.log(`Deleting task with ID ${id} for user ${user.username}`);
    await this.tasksService.deleteTask(id, user);
    this.logger.log(`Deleted task with ID ${id} for user ${user.username}`);
  }

  @Patch('/:id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    this.logger.log(
      `Updating status of task with ID ${id} for user ${user.username}`,
    );
    const response = await this.tasksService.updateTaskStatus(id, status, user);
    this.logger.log(
      `Updated status of task with ID ${id} to ${status} for user ${user.username}`,
    );
    return response;
  }
}
