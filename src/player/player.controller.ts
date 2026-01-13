import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { PlayerService } from './player.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import {type CreatePlayerDto, createPlayerDtoSchema } from './dto/create-player.dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post("/")
  @UsePipes(new ZodValidationPipe(createPlayerDtoSchema))
  async createPlayer(@Body() body: CreatePlayerDto){
    const result = await this.playerService.create(body)

    return {result}
  }
  
}
