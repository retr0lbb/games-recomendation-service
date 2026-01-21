import { Controller, Post, Body, Param, UsePipes, Get, Put, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PlayerService } from './player.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type CreatePlayerDto, createPlayerDtoSchema } from './dto/create-player.dto';
import { addGameToPlayer, type AddGameToPlayerDto } from './dto/setPlayerGame';
import { type UpdatePlayerStatusDto, updatePlayStatusSchema } from './dto/update-play-status';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/types/jwt-payload';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post("/platforms")
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createPlayerDtoSchema))
  async createPlayer(@Req() req: Request, @Body() body: CreatePlayerDto){
    const { id } = req.user as JwtPayload

    if(!id){
      throw new UnauthorizedException()
    }

    await this.playerService.assignPlayerPlatforms(body, id)

    const response = {
      status: 201,
      message: "platforms added to user!"
    }

    return response
  }


  @Post("/game")
  @UseGuards(JwtAuthGuard)
  async setPlayerGame(@Req() req: Request, @Body(new ZodValidationPipe(addGameToPlayer)) body: AddGameToPlayerDto) {
  
    const { id } = req.user as JwtPayload

    if(!id){
      throw new UnauthorizedException()
    }
    await this.playerService.createPlayerGame(id, body)

    const response = {
      status: 201,
      message: "relation created with success"
    }

    return response
  }

  @Get("/game")
  @UseGuards(JwtAuthGuard)
  async getPlayerGames(@Req() req: Request){
    const { id } = req.user as JwtPayload

    if(!id){
      throw new UnauthorizedException()
    }

    const result = await this.playerService.getPlayerGames(id)

    return {...result}
  }

  @Put("/game/:gameId")
  @UseGuards(JwtAuthGuard)
  async updateGameplayStatus(
    @Param("gameId") gameId: number,
    @Req() req: Request, 
    @Body(new ZodValidationPipe(updatePlayStatusSchema)) body: UpdatePlayerStatusDto
  )
    {
      const { id } = req.user as JwtPayload

      if(!id){
        throw new UnauthorizedException()
      }
      
      const result = await this.playerService.updatePlayStatus(id, gameId, body)

      return result
  }
  
}
