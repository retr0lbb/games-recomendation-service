import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import crypto from "node:crypto"
import { AddGameToPlayerDto } from './dto/setPlayerGame';
import { UpdatePlayerStatusDto } from './dto/update-play-status';

@Injectable()
export class PlayerService {
  constructor(private readonly neo4jService: Neo4jService){}

  async assignPlayerPlatforms(createPlayerDto: CreatePlayerDto, userId: string) {
    const query = `
      MERGE (p:Player { id: $id })

      WITH p

      UNWIND $platforms as plat
       MATCH (pt:Platform { id: toInteger(plat) })
       MERGE (p)-[:OWNS {gameCount: 0}]->(pt)

      RETURN p
    `

    const params = {
      id: userId,
      platforms: createPlayerDto.platforms
    }

    await this.neo4jService.getSession().run(query, params)
  }

  async updatePlayingStatus(createPlayerDto: CreatePlayerDto) {
    const newPlayerId = crypto.randomUUID()

    const query = `
      MERGE (p:Player { id: $id })
      SET p.name = $name

      WITH p

      UNWIND $platforms as plat
       MATCH (pt:Platform { id: toInteger(plat) })
       MERGE (p)-[:OWNS {gameCount: 0}]->(pt)

      RETURN p
    `

    const params = {
      id: newPlayerId,
      platforms: createPlayerDto.platforms
    }

    const result = await this.neo4jService.getSession().run(query, params)

    return result.records[0].get("p").properties
  }

  async createPlayerGame(userId: string, data: AddGameToPlayerDto){
    const query = `
      MATCH (p:Player { id: $userId })
      MATCH (g:Game { id: $gameId })

      FOREACH (_ IN CASE WHEN $status = 'has_finished' THEN [1] ELSE [] END |
        MERGE (p)-[r:FINISHED]->(g)
        SET r.hours_played = $hours,
            r.finishedAt = $finishedAt,
            r.score = $score
      )

      FOREACH (_ IN CASE WHEN $status = 'is_playing' THEN [1] ELSE [] END |
        MERGE (p)-[r:IS_PLAYING]->(g)
        SET r.hours_played = $hours,
            r.currentScore = $score
      )

      RETURN p, g
    `

    const params = {
      userId,
      gameId: data.gameId,
      status: data.status,
      hours: Number(data.hours_played ?? 0),
      finishedAt: data.finishedAt
        ? new Date(data.finishedAt).toISOString()
        : null,
      score: data.score !== undefined ? Number(data.score) : null
    }
    const result = await this.neo4jService.getSession().run(query, params)
  }

  async updatePlayStatus(userId: string, gameId: number, body: UpdatePlayerStatusDto){
    const queryToFinished = `
      MATCH (p:Player {id: $userId})-[old:IS_PLAYING]->(g:Game {id: toInteger($gameId)})
      WITH p, g, old, old.hours_played AS hours, old.currentScore AS score
      DELETE old
      CREATE (p)-[new:FINISHED {
        hours_played: hours,
        score: score,
        finishedAt: datetime()
      }]->(g)
      RETURN p, new, g
    `

    const queryToPlaying = `
      MATCH (p:Player {id: $userId})-[old:FINISHED]->(g:Game {id: toInteger($gameId)})
      DELETE old
      CREATE (p)-[new:IS_PLAYING {
        currentScore: $score, 
        hours_played: $hours
      }]->(g)
      RETURN p, new, g
    `

    if(body.status === "has_finished"){
      const result = await this.neo4jService.getSession().run(queryToFinished, {
        userId: userId, 
        gameId: gameId
      })
      
      return result.records[0].toObject()
    }

    // Se o novo status é "is_playing", marca como IS_PLAYING
    if(body.status === "is_playing"){
      const result = await this.neo4jService.getSession().run(queryToPlaying, {
        userId: userId, 
        gameId: gameId, 
        score: body.updateScore ?? 0, 
        hours: body.hoursPlaying ?? 0
      })
      
      return result.records[0].toObject()
    }
  
  }

  async getPlayerGames(playerId: string){
    const query = `
      MATCH(p:Player {id: $id})-[n]->(g:Game) 
      RETURN p, n, g
    `
    const params = {
      id: playerId
    }

    const result = await this.neo4jService.getSession().run(query, params)

    if (result.records.length === 0) {
      return null
    }

    const playerNode = result.records[0].get("p")
    
    const player = {
      id: playerNode.properties.id,
      name: playerNode.properties.name
    }

    const games = result.records.map(record => {
      const relationship = record.get("n")
      const gameNode = record.get("g")

      return {
        gameId: typeof gameNode.properties.id === "number"? gameNode.properties.id: gameNode.properties.id.low,
        title: gameNode.properties.title,
        slug: gameNode.properties.slug,
        hours_played: relationship.properties.hours_played,
        currentScore: relationship.properties.currentScore,
        imageUrl: gameNode.properties.imageUrl,
        releaseDate: gameNode.properties.releaseDate,
        metacriticScore: gameNode.properties.metacriticScore,
        summary: gameNode.properties.summary
      }
    })
    return { player, games }
  }
}
