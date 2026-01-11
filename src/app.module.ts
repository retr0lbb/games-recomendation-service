import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecomendationsModule } from './recomendations/recomendations.module';

@Module({
  imports: [RecomendationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
