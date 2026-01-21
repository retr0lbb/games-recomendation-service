import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecomendationsModule } from './recomendations/recomendations.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { GamesModule } from './games/games.module';
import { RawgModule } from './rawg/rawg.module';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [RecomendationsModule, Neo4jModule, GamesModule, RawgModule, ConfigModule.forRoot({isGlobal: true}), PlayerModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
