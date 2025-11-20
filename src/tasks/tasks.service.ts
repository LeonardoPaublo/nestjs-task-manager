import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task, TaskStatus } from './task.model';

interface ITaskService {
  getAllTasks(): Task[];
  getTasksWithFilters(filters: GetTasksFilterDto): Task[];
  getTaskById(id: string): Task;
  createTask(createTaskDto: CreateTaskDto): Task;
  deleteTask(id: string): void;
  updateTaskStatus(id: string, status: TaskStatus): Task;
}

@Injectable()
export class TasksService implements ITaskService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTasksWithFilters(filters: GetTasksFilterDto): Task[] {
    const { status, search } = filters;
    let tasks = this.getAllTasks();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(
        (task) =>
          task.title.includes(search) || task.description.includes(search),
      );
    }

    return tasks;
  }

  getTaskById(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      Logger.error(`Task with ID "${id}" not found`, TasksService.name);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const newTask: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  deleteTask(id: string): void {
    const taskToBeDeleted = this.getTaskById(id);

    if (!taskToBeDeleted) {
      Logger.error(`Task with ID "${id}" not found`, TasksService.name);
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
