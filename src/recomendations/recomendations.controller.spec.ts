import { Test, TestingModule } from '@nestjs/testing';
import { RecomendationsController } from './recomendations.controller';

describe('RecomendationsController', () => {
  let controller: RecomendationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendationsController],
    }).compile();

    controller = module.get<RecomendationsController>(RecomendationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
