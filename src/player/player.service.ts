import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import crypto from "node:crypto"
import { AddGameToPlayerDto } from './dto/setPlayerGame';
import { resourceLimits } from 'node:worker_threads';

@Injectable()
export class PlayerService {
  constructor(private readonly neo4jService: Neo4jService){}

  async create(createPlayerDto: CreatePlayerDto) {
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
      name: createPlayerDto.name,
      id: newPlayerId,
      platforms: createPlayerDto.platforms
    }

    const result = await this.neo4jService.getSession().run(query, params)

    return result.records[0].get("p").properties
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
      name: createPlayerDto.name,
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

  async updatePlayStatus(userId: string, gameId: string, score?: number){
    const query = `
      MATCH (p:Player {id: $userId})-[old:IS_PLAYING]->(g:Game {id: $gameId})
      DELETE old
      CREATE (p)-[new:FINISHED {
        hours_played: old.hours_played,
        score: old.currentScore,
        finishedAt: datetime()
      }]->(g)
      RETURN p, new, g
    `
  
    const params = {
      userId: userId,
      gameId: gameId
    }

    const result = await this.neo4jService.getSession().run(query, params)
  
    return result.records[0]
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
