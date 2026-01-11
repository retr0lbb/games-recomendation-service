import { Injectable } from '@nestjs/common';
import type { ImportBulkyFromRawgDto } from './dto/import-bulky-rawg.dto';
import { RawgService } from 'src/rawg/rawg.service';

@Injectable()
export class GamesService {
  constructor(private  readonly rawgService: RawgService) {}
  async importFromRawg(gameId: number){
    const game = await this.rawgService.getGameById(gameId)

    return {game}
  }

  importFromRawgBulky(dto: ImportBulkyFromRawgDto){

  }
}
