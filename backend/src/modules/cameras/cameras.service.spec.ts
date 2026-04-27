import { Test, TestingModule } from '@nestjs/testing';
import { CamerasService } from './cameras.service';
import { beforeEach, describe, it } from 'node:test';

describe('CamerasService', () => {
  let service: CamerasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CamerasService],
    }).compile();

    service = module.get<CamerasService>(CamerasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

export function expect<T>(actual: T) {
  return {
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined, but received ${actual}`);
      }
    },
  };
}

