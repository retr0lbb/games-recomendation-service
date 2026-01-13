import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { GamesService } from './games.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type ImportBulkyFromRawgDto, importBulkyFromRawgSchema } from './dto/import-bulky-rawg.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post("import/rawg/:rawgId")
  async importFromRawg(@Param("rawgId") rawgId: number) {
    return await this.gamesService.importFromRawg(rawgId)
  }
  
  @Post("import/bulk/rawg")
  @UsePipes(new ZodValidationPipe(importBulkyFromRawgSchema))
  importBulkyFromRawg(@Body() body: ImportBulkyFromRawgDto){
    
  }

  @Get("/")
  async getAllGames(){
    const games = await this.gamesService.getAll()

    return {games}
  }

  @Get("/:id")
  async getGameById(@Param("id") id: number){
    const game = await this.gamesService.getGameById(id)

    return { game }
  }

}
