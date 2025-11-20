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
import { Task } from './task.model';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(@Query() filterDto: GetTasksFilterDto): Task[] {
    if (Object.keys(filterDto).length) {
      Logger.log(
        `Getting tasks with filters: ${JSON.stringify(filterDto)}`,
        TasksController.name,
      );
      const response = this.tasksService.getTasksWithFilters(filterDto);
      Logger.log(
        `Found ${response.length} tasks with applied filters`,
        TasksController.name,
      );
      return response;
    }

    Logger.log('Getting all tasks', TasksController.name);
    const response = this.tasksService.getAllTasks();
    Logger.log(`Found ${response.length} tasks`, TasksController.name);
    return response;
  }

  @Get('/:id')
  getTaskById(@Param() getTaskByIdDto: GetTaskByIdDto): Task {
    const { id } = getTaskByIdDto;
    Logger.log(`Getting task with ID ${id}`, TasksController.name);
    const response = this.tasksService.getTaskById(id);
    if (response) {
      Logger.log(`Found task with ID ${id}`, TasksController.name);
    }
    return response;
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    Logger.log('Creating a new task', TasksController.name);
    const response = this.tasksService.createTask(createTaskDto);
    Logger.log(`Created task with ID ${response.id}`, TasksController.name);
    return response;
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): void {
    Logger.log(`Deleting task with ID ${id}`, TasksController.name);
    this.tasksService.deleteTask(id);
    Logger.log(`Deleted task with ID ${id}`, TasksController.name);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Task {
    const { status } = updateTaskStatusDto;
    Logger.log(`Updating status of task with ID ${id}`, TasksController.name);
    const response = this.tasksService.updateTaskStatus(id, status);
    Logger.log(
      `Updated status of task with ID ${id} to ${status}`,
      TasksController.name,
    );
    return response;
  }
}
