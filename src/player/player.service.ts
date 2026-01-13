import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import crypto from "node:crypto"

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

}
