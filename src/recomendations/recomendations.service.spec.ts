import { Test, TestingModule } from '@nestjs/testing';
import { RecomendationsService } from './recomendations.service';

describe('RecomendationsService', () => {
  let service: RecomendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecomendationsService],
    }).compile();

    service = module.get<RecomendationsService>(RecomendationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
