import { Task } from '../task.entity';
import { TaskStatus } from '../task-status.enum';
import { User } from '../../auth/user.entity';

export const mockUser: User = {
  id: 'user-id-123',
  username: 'testuser',
  password: 'hashedPassword123',
  tasks: [],
};

export const mockTask: Task = {
  id: 'task-id-123',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.OPEN,
  user: mockUser,
};

export const mockTasks: Task[] = [
  {
    id: 'task-id-1',
    title: 'Task 1',
    description: 'Description 1',
    status: TaskStatus.OPEN,
    user: mockUser,
  },
  {
    id: 'task-id-2',
    title: 'Task 2',
    description: 'Description 2',
    status: TaskStatus.IN_PROGRESS,
    user: mockUser,
  },
  {
    id: 'task-id-3',
    title: 'Task 3',
    description: 'Description 3',
    status: TaskStatus.DONE,
    user: mockUser,
  },
];
