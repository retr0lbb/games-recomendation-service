import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { RawgModule } from 'src/rawg/rawg.module';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [RawgModule, Neo4jModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
