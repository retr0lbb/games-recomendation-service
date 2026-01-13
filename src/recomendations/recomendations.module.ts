import { Module } from '@nestjs/common';
import { RecomendationsService } from './recomendations.service';
import { RecomendationsController } from './recomendations.controller';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  providers: [RecomendationsService],
  controllers: [RecomendationsController]
})
export class RecomendationsModule {}
