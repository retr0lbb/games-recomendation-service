import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { GamesService } from './games.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type SetPlayerGameBodyDTO, setPlayerGameSchema } from './dto/setPlayerGame';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post("import/rawg/:rawgId")
  async importFromRawg(@Param("rawgId") rawgId: number) {
    return await this.gamesService.importFromRawg(rawgId)
  }
  

  @Post("/:userId")
  async setPlayerGame(@Param("userId") userId: string, @Body(new ZodValidationPipe(setPlayerGameSchema)) body: SetPlayerGameBodyDTO) {
    await this.gamesService.createPlayerGame(userId, body)

    const response = {
      status: 201,
      message: "relation created with success"
    }

    return response
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
