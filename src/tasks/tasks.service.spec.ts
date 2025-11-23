import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockLogger } from './__mocks__/logger.mock';
import { mockTask, mockTasks, mockUser } from './__mocks__/mock-data';
import { mockTasksRepository } from './__mocks__/tasks-repository.mock';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: jest.Mocked<TasksRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: mockTasksRepository(),
        },
        {
          provide: Logger,
          useValue: mockLogger(),
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get(TasksRepository);
    logger = module.get(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return an array of tasks from the repository', async () => {
      const filterDto: GetTasksFilterDto = {};
      tasksRepository.getTasks.mockResolvedValue(mockTasks);

      const result = await tasksService.getTasks(filterDto, mockUser);

      expect(result).toEqual(mockTasks);
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
      expect(tasksRepository.getTasks).toHaveBeenCalledTimes(1);
    });

    it('should return filtered tasks by status', async () => {
      const filterDto: GetTasksFilterDto = { status: TaskStatus.OPEN };
      const filteredTasks = mockTasks.filter(
        (task) => task.status === TaskStatus.OPEN,
      );
      tasksRepository.getTasks.mockResolvedValue(filteredTasks);

      const result = await tasksService.getTasks(filterDto, mockUser);

      expect(result).toEqual(filteredTasks);
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
    });

    it('should return filtered tasks by search term', async () => {
      const filterDto: GetTasksFilterDto = { search: 'Task 1' };
      const filteredTasks = [mockTasks[0]];
      tasksRepository.getTasks.mockResolvedValue(filteredTasks);

      const result = await tasksService.getTasks(filterDto, mockUser);

      expect(result).toEqual(filteredTasks);
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
    });

    it('should return an empty array when no tasks match the filter', async () => {
      const filterDto: GetTasksFilterDto = { search: 'NonExistent' };
      tasksRepository.getTasks.mockResolvedValue([]);

      const result = await tasksService.getTasks(filterDto, mockUser);

      expect(result).toEqual([]);
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
    });

    it('should return filtered tasks by both status and search', async () => {
      const filterDto: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Task 2',
      };
      const filteredTasks = [mockTasks[1]];
      tasksRepository.getTasks.mockResolvedValue(filteredTasks);

      const result = await tasksService.getTasks(filterDto, mockUser);

      expect(result).toEqual(filteredTasks);
      expect(tasksRepository.getTasks).toHaveBeenCalledWith(
        filterDto,
        mockUser,
      );
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      const taskId = 'task-id-123';
      tasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(taskId, mockUser);

      expect(result).toEqual(mockTask);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, user: mockUser },
      });
      expect(tasksRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when task is not found', async () => {
      const taskId = 'non-existent-id';
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(tasksService.getTaskById(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(tasksService.getTaskById(taskId, mockUser)).rejects.toThrow(
        `Task with ID "${taskId}" not found`,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Task with ID "${taskId}" not found`,
      );
    });

    it('should throw NotFoundException when task belongs to different user', async () => {
      const taskId = 'task-id-123';
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(tasksService.getTaskById(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, user: mockUser },
      });
    });

    it('should handle UUID validation correctly', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      tasksRepository.findOne.mockResolvedValue({
        ...mockTask,
        id: validUuid,
      });

      const result = await tasksService.getTaskById(validUuid, mockUser);

      expect(result.id).toBe(validUuid);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid, user: mockUser },
      });
    });
  });

  describe('createTask', () => {
    it('should successfully create and return a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      const newTask = {
        ...mockTask,
        title: createTaskDto.title,
        description: createTaskDto.description,
      };
      tasksRepository.createTask.mockResolvedValue(newTask);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result).toEqual(newTask);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(tasksRepository.createTask).toHaveBeenCalledTimes(1);
    });

    it('should create task with OPEN status by default', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };
      const newTask = {
        ...mockTask,
        status: TaskStatus.OPEN,
      };
      tasksRepository.createTask.mockResolvedValue(newTask);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result.status).toBe(TaskStatus.OPEN);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
    });

    it('should associate task with the correct user', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'User Task',
        description: 'Task for specific user',
      };
      const newTask = {
        ...mockTask,
        user: mockUser,
      };
      tasksRepository.createTask.mockResolvedValue(newTask);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result.user).toEqual(mockUser);
      expect(tasksRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
    });

    it('should handle special characters in title and description', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task with special chars: @#$%',
        description: 'Description with <html> tags & symbols!',
      };
      const newTask = {
        ...mockTask,
        title: createTaskDto.title,
        description: createTaskDto.description,
      };
      tasksRepository.createTask.mockResolvedValue(newTask);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result.title).toBe(createTaskDto.title);
      expect(result.description).toBe(createTaskDto.description);
    });

    it('should handle long text in title and description', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'A'.repeat(255),
        description: 'B'.repeat(1000),
      };
      const newTask = {
        ...mockTask,
        title: createTaskDto.title,
        description: createTaskDto.description,
      };
      tasksRepository.createTask.mockResolvedValue(newTask);

      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result.title).toBe(createTaskDto.title);
      expect(result.description).toBe(createTaskDto.description);
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task', async () => {
      const taskId = 'task-id-123';
      tasksRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await tasksService.deleteTask(taskId, mockUser);

      expect(tasksRepository.delete).toHaveBeenCalledWith({
        id: taskId,
        user: mockUser,
      });
      expect(tasksRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when task to delete is not found', async () => {
      const taskId = 'non-existent-id';
      tasksRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(tasksService.deleteTask(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(tasksService.deleteTask(taskId, mockUser)).rejects.toThrow(
        `Task with ID "${taskId}" not found`,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Task with ID "${taskId}" not found`,
      );
    });

    it('should not delete task belonging to different user', async () => {
      const taskId = 'task-id-123';
      tasksRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(tasksService.deleteTask(taskId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(tasksRepository.delete).toHaveBeenCalledWith({
        id: taskId,
        user: mockUser,
      });
    });

    it('should return void on successful deletion', async () => {
      const taskId = 'task-id-123';
      tasksRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await tasksService.deleteTask(taskId, mockUser);

      expect(result).toBeUndefined();
    });

    it('should handle multiple affected rows (edge case)', async () => {
      const taskId = 'task-id-123';
      tasksRepository.delete.mockResolvedValue({ affected: 2, raw: [] });

      const result = await tasksService.deleteTask(taskId, mockUser);

      expect(result).toBeUndefined();
      expect(tasksRepository.delete).toHaveBeenCalledWith({
        id: taskId,
        user: mockUser,
      });
    });
  });

  describe('updateTaskStatus', () => {
    it('should successfully update task status from OPEN to IN_PROGRESS', async () => {
      const taskId = 'task-id-123';
      const newStatus = TaskStatus.IN_PROGRESS;
      const existingTask = { ...mockTask, status: TaskStatus.OPEN };
      const updatedTask = { ...existingTask, status: newStatus };

      tasksRepository.findOne.mockResolvedValue(existingTask);
      tasksRepository.save.mockResolvedValue(updatedTask);

      await tasksService.updateTaskStatus(taskId, newStatus, mockUser);

      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, user: mockUser },
      });
      expect(tasksRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        status: newStatus,
      });
    });

    it('should successfully update task status from IN_PROGRESS to DONE', async () => {
      const taskId = 'task-id-123';
      const newStatus = TaskStatus.DONE;
      const existingTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };

      tasksRepository.findOne.mockResolvedValue(existingTask);
      tasksRepository.save.mockResolvedValue({
        ...existingTask,
        status: newStatus,
      });

      await tasksService.updateTaskStatus(taskId, newStatus, mockUser);

      expect(tasksRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        status: newStatus,
      });
    });

    it('should successfully update task status from DONE back to OPEN', async () => {
      const taskId = 'task-id-123';
      const newStatus = TaskStatus.OPEN;
      const existingTask = { ...mockTask, status: TaskStatus.DONE };

      tasksRepository.findOne.mockResolvedValue(existingTask);
      tasksRepository.save.mockResolvedValue({
        ...existingTask,
        status: newStatus,
      });

      await tasksService.updateTaskStatus(taskId, newStatus, mockUser);

      expect(tasksRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        status: newStatus,
      });
    });

    it('should throw NotFoundException when task to update is not found', async () => {
      const taskId = 'non-existent-id';
      const newStatus = TaskStatus.IN_PROGRESS;
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(
        tasksService.updateTaskStatus(taskId, newStatus, mockUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        tasksService.updateTaskStatus(taskId, newStatus, mockUser),
      ).rejects.toThrow(`Task with ID "${taskId}" not found`);
      expect(logger.error).toHaveBeenCalledWith(
        `Task with ID "${taskId}" not found`,
      );
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });

    it('should not update task belonging to different user', async () => {
      const taskId = 'task-id-123';
      const newStatus = TaskStatus.DONE;
      tasksRepository.findOne.mockResolvedValue(null);

      await expect(
        tasksService.updateTaskStatus(taskId, newStatus, mockUser),
      ).rejects.toThrow(NotFoundException);
      expect(tasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId, user: mockUser },
      });
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });

    it('should handle updating to the same status (idempotent operation)', async () => {
      const taskId = 'task-id-123';
      const currentStatus = TaskStatus.OPEN;
      const existingTask = { ...mockTask, status: currentStatus };

      tasksRepository.findOne.mockResolvedValue(existingTask);
      tasksRepository.save.mockResolvedValue(existingTask);

      await tasksService.updateTaskStatus(taskId, currentStatus, mockUser);

      expect(tasksRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        status: currentStatus,
      });
    });

    it('should preserve all task properties when updating status', async () => {
      const taskId = 'task-id-123';
      const newStatus = TaskStatus.DONE;
      const existingTask = {
        id: 'task-id-123',
        title: 'Important Task',
        description: 'Detailed description',
        status: TaskStatus.IN_PROGRESS,
        user: mockUser,
      };

      tasksRepository.findOne.mockResolvedValue(existingTask);
      tasksRepository.save.mockResolvedValue({
        ...existingTask,
        status: newStatus,
      });

      await tasksService.updateTaskStatus(taskId, newStatus, mockUser);

      expect(tasksRepository.save).toHaveBeenCalledWith({
        id: existingTask.id,
        title: existingTask.title,
        description: existingTask.description,
        status: newStatus,
        user: existingTask.user,
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle repository errors gracefully in getTasks', async () => {
      const filterDto: GetTasksFilterDto = {};
      const error = new Error('Database connection failed');
      tasksRepository.getTasks.mockRejectedValue(error);

      await expect(tasksService.getTasks(filterDto, mockUser)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle repository errors gracefully in createTask', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test',
        description: 'Test',
      };
      const error = new Error('Database write failed');
      tasksRepository.createTask.mockRejectedValue(error);

      await expect(
        tasksService.createTask(createTaskDto, mockUser),
      ).rejects.toThrow('Database write failed');
    });

    it('should handle repository errors gracefully in deleteTask', async () => {
      const taskId = 'task-id-123';
      const error = new Error('Database delete failed');
      tasksRepository.delete.mockRejectedValue(error);

      await expect(tasksService.deleteTask(taskId, mockUser)).rejects.toThrow(
        'Database delete failed',
      );
    });

    it('should handle null or undefined user gracefully', async () => {
      const filterDto: GetTasksFilterDto = {};
      tasksRepository.getTasks.mockResolvedValue([]);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await tasksService.getTasks(filterDto, null as any);

      expect(tasksRepository.getTasks).toHaveBeenCalledWith(filterDto, null);
      expect(result).toEqual([]);
    });
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(tasksService).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(tasksService.getTasks).toBeDefined();
      expect(tasksService.getTaskById).toBeDefined();
      expect(tasksService.createTask).toBeDefined();
      expect(tasksService.deleteTask).toBeDefined();
      expect(tasksService.updateTaskStatus).toBeDefined();
    });

    it('should inject TasksRepository dependency', () => {
      expect(tasksRepository).toBeDefined();
    });

    it('should inject Logger dependency', () => {
      expect(logger).toBeDefined();
    });
  });
});
