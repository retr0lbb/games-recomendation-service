import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { RawgModule } from 'src/rawg/rawg.module';

@Module({
  imports: [RawgModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
