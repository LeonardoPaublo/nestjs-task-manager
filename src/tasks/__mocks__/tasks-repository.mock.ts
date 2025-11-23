import { TasksRepository } from '../tasks.repository';

export const mockTasksRepository = (): jest.Mocked<TasksRepository> =>
  ({
    getTasks: jest.fn(),
    createTask: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  }) as any;
