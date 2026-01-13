import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';

@Injectable()
export class RecomendationsService {
    constructor(private readonly neo4jService: Neo4jService) {}


    async recommendAGame() {
        const query = `
            MATCH (me:Player {id: "b50ac6de-f2b3-42c8-8224-d69eeed0b817"})-[myRel:IS_PLAYING|FINISHED]->(myGame:Game)

            MATCH (other:Player)-[otherRel:IS_PLAYING|FINISHED]->(myGame)
            WHERE other <> me
            AND otherRel.score >= 7

            WITH DISTINCT me, other,
            sum(
                log(otherRel.hours_played + 1) *
                CASE WHEN otherRel:FINISHED THEN 1.3 ELSE 1.0 END
            ) AS similarityScore

            // 3. Jogos bem avaliados por esses players
            MATCH (other)-[recRel:IS_PLAYING|FINISHED]->(recGame:Game)
            WHERE recRel.score >= 7
            AND NOT (me)-[:IS_PLAYING|FINISHED]->(recGame)

            // 4. Plataformas do usuário
            MATCH (recGame)-[:AVAILABLE_ON]->(plat:Platform)
            MATCH (me)-[:OWNS]->(plat)

            OPTIONAL MATCH (me)-[:IS_PLAYING|FINISHED]->(:Game)-[:HAS_GENRE]->(commonGenre:Genre)
            MATCH (recGame)-[:HAS_GENRE]->(commonGenre)

            WITH
            recGame,
            similarityScore,
            count(DISTINCT commonGenre) AS genreMatchCount,
            log(recRel.hours_played + 1) *
            CASE WHEN recRel:FINISHED THEN 1.3 ELSE 1.0 END AS interactionWeight

            RETURN
            recGame.id AS gameId,
            recGame.title AS title,

            // Score final
            sum(similarityScore * interactionWeight)
            * (1 + genreMatchCount * 0.2)
            AS recommendationScore,

            genreMatchCount
            ORDER BY recommendationScore DESC
            LIMIT 20
        `
        
    }
}
