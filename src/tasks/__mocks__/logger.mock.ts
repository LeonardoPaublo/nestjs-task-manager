import { Logger } from '@nestjs/common';

export const mockLogger = (): jest.Mocked<Logger> =>
  ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  }) as any;
