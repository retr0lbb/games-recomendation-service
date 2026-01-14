import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecomendationsService } from './recomendations.service';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type SaveRecommendationsDto, saveRecommendationsSchema } from './dto/save-recomendations-dto';

@Controller('recommendations')
export class RecomendationsController {

    constructor (private readonly recommendationService: RecomendationsService){}

    @Get("/:userId")
    async getUserRecommendation(@Param("userId") userId: string){
        const result = await this.recommendationService.recommendAGame(userId)

        return result
    }


    @Post("/:userId/save")
    async saveUserRecommendations(
        @Param("userId") userId: string, 
        @Body(new ZodValidationPipe(saveRecommendationsSchema)) body: SaveRecommendationsDto
    ){
        const result = await this.recommendationService.saveRecommendations(userId, body)

        return result

    }

}
