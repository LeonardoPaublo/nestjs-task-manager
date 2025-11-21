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
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskByIdDto } from './dto/get-task-by-id.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Query() filterDto: GetTasksFilterDto): Promise<Task[]> {
    Logger.log(
      'Getting all tasks',
      { filter: filterDto },
      TasksController.name,
    );
    const response = await this.tasksService.getTasks(filterDto);
    Logger.log(`Found ${response.length} tasks`, TasksController.name);
    return response;
  }

  @Get('/:id')
  async getTaskById(@Param() getTaskByIdDto: GetTaskByIdDto): Promise<Task> {
    const { id } = getTaskByIdDto;
    Logger.log(`Getting task with ID ${id}`, TasksController.name);
    const response = await this.tasksService.getTaskById(id);
    Logger.log(`Retrieved task with ID ${id}`, TasksController.name);
    return response;
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    Logger.log('Creating a new task', TasksController.name);
    const response = await this.tasksService.createTask(createTaskDto);
    Logger.log(`Created task with ID ${response.id}`, TasksController.name);
    return response;
  }

  @Delete('/:id')
  async deleteTask(@Param('id') id: string): Promise<void> {
    Logger.log(`Deleting task with ID ${id}`, TasksController.name);
    await this.tasksService.deleteTask(id);
    Logger.log(`Deleted task with ID ${id}`, TasksController.name);
  }

  @Patch('/:id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    Logger.log(`Updating status of task with ID ${id}`, TasksController.name);
    const response = await this.tasksService.updateTaskStatus(id, status);
    Logger.log(
      `Updated status of task with ID ${id} to ${status}`,
      TasksController.name,
    );
    return response;
  }
}
