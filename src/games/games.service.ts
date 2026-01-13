import { Injectable } from '@nestjs/common';
import type { ImportBulkyFromRawgDto } from './dto/import-bulky-rawg.dto';
import { RawgService } from 'src/rawg/rawg.service';
import { GameDto } from './dto/game.dto';
import { Neo4jService } from 'src/neo4j/neo4j.service';

@Injectable()
export class GamesService {
  constructor(private  readonly rawgService: RawgService, private readonly neo4jService: Neo4jService) {}
  async importFromRawg(gameId: number){
    const game = await this.rawgService.getGameById(gameId)

    const betterGame: GameDto = {
      id: game.id,
      slug: game.slug,
      title: game.name,
      released: game.released,
      imageUrl: game.background_image ?? "",
      metacriticScore: game.metacritic,
      summary: game.description_raw,
      genres: game.genres.map((genre: {id: number, name: string, slug: string}) => {
        return{
          id: genre.id,
          slug: genre.slug,
          name: genre.name
        }
      }),
      platforms: game.platforms.map((platform: {platform: {id: number, name: string, slug: string}}) => {
        return {
          id: platform.platform.id,
          slug: platform.platform.slug,
          name: platform.platform.name
        }
      })
    }

    const result = await this.createOrUpdate(betterGame)

    console.log(result)


    return result
  }

  importFromRawgBulky(dto: ImportBulkyFromRawgDto){

  }

  async createOrUpdate(game: GameDto){
    const query = `

      MERGE(g:Game {id: $id})
      SET g+={
        title: $title,
        slug: $slug,
        imageUrl: $url,
        releaseDate: $release,
        metacriticScore: $score,
        summary: $summary
      } 

      WITH g

      UNWIND $genres AS genre
        MERGE (ge:Genre { id: genre.id })
        SET
          ge.name = genre.name,
          ge.slug = genre.slug
        MERGE (g)-[:HAS_GENRE]->(ge)

      WITH g

      UNWIND $platforms AS platform
        MERGE (p:Platform { id: platform.id })
        SET
          p.name = platform.name,
          p.slug = platform.slug
        MERGE (g)-[:AVAILABLE_ON]->(p)

      RETURN g
    `
    const params = {
      id: Number(game.id),
      release: game.released,
      title: game.title,
      slug: game.slug,
      url: game.imageUrl,
      score: game.metacriticScore,
      summary: game.summary,
      genres: game.genres,
      platforms: game.platforms
    }

    const result = await this.neo4jService.getSession().run(query, params)
    return result.records[0].get('g').properties;
  }

  async getAll(){
    const query = `
      MATCH(g:Game) return g;
    `

    const result = await this.neo4jService.getSession().run(query)

    const gamesObj = result.records.map(record =>{
      const game = record.get("g")

      return game.properties
    })

    return gamesObj
  }

  async getGameById(gameId: number){
    const query = `
      MATCH (g:Game)
        WHERE toInteger(g.id) = toInteger($id)
        RETURN g
    `
    const params = {
      id: gameId
    }

    const result = await this.neo4jService.getSession().run(query, params)

    const gamesObj = result.records.map(record =>{
      const game = record.get("g")

      return game.properties
    })

    return gamesObj
  }
}
