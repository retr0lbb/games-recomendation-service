import { Controller, Post, Body, Param, UsePipes, Get, Put } from '@nestjs/common';
import { PlayerService } from './player.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type CreatePlayerDto, createPlayerDtoSchema } from './dto/create-player.dto';
import { addGameToPlayer, type AddGameToPlayerDto } from './dto/setPlayerGame';
import { type UpdatePlayerStatusDto, updatePlayStatusSchema } from './dto/update-play-status';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post("/")
  @UsePipes(new ZodValidationPipe(createPlayerDtoSchema))
  async createPlayer(@Body() body: CreatePlayerDto){
    const result = await this.playerService.create(body)

    return {result}
  }


  @Post("/:userId/game")
  async setPlayerGame(@Param("userId") userId: string, @Body(new ZodValidationPipe(addGameToPlayer)) body: AddGameToPlayerDto) {
    await this.playerService.createPlayerGame(userId, body)

    const response = {
      status: 201,
      message: "relation created with success"
    }

    return response
  }

  @Get("/:userId/game")
  async getPlayerGames(@Param("userId") userId: string){
    const result = await this.playerService.getPlayerGames(userId)

    return {...result}
  }

  @Put("/:userId/game/:gameId")
  async updateGameplayStatus(
    @Param("userId") userId: string, 
    @Param("gameId") gameId: number, 
    @Body(new ZodValidationPipe(updatePlayStatusSchema)) body: UpdatePlayerStatusDto){
      
      const result = await this.playerService.updatePlayStatus(userId, gameId, body)

      return result
  }
  
}
