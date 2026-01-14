import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { object } from 'zod';
import { SaveRecommendationsDto } from './dto/save-recomendations-dto';

@Injectable()
export class RecomendationsService {
    constructor(private readonly neo4jService: Neo4jService) {}

    async recommendAGame(id: string) {
        const query = `
            MATCH (me:Player {id: $id})-[myRel:IS_PLAYING|FINISHED]->(myGame:Game)

            MATCH (other:Player)-[otherRel:IS_PLAYING|FINISHED]->(myGame)
            WHERE other <> me
            AND otherRel.score >= 7

            WITH DISTINCT me, other,
            sum(
                log(otherRel.hours_played + 1) *
                CASE WHEN otherRel:FINISHED THEN 1.3 ELSE 1.0 END
            ) AS similarityScore

            MATCH (other)-[recRel:IS_PLAYING|FINISHED]->(recGame:Game)
            WHERE recRel.score >= 7
            AND NOT (me)-[:IS_PLAYING|FINISHED]->(recGame)

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
            recGame.imageUrl as image,
            recGame.metacriticScore as metaScore,
            recGame.summary as summary,

            sum(similarityScore * interactionWeight)
            * (1 + genreMatchCount * 0.2)
            AS recommendationScore,

            genreMatchCount
            ORDER BY recommendationScore DESC
            LIMIT 20
        `

        const params = {
            id: id
        }

        const result = await this.neo4jService.getSession().run(query, params)

        return result.records.map(rec => {

            const objRec = rec.toObject()

            const formatedScore: number = objRec.recommendationScore

            console.log(objRec)

            return {
                gameId: objRec.gameId.low,
                title: objRec.title,
                score: formatedScore.toFixed(2),
                image: objRec.image,
                metacriticScore: objRec.score,
                summary: objRec.summary
            }
        })
    }

    async saveRecommendations(userId: string, body: SaveRecommendationsDto){
        const query = `
            MATCH (p:Player {id: $id})
            UNWIND $game AS game
                MATCH(g:Game {id: toInteger(game.gameId)})

                MERGE(p)-[r:SAVED_RECOMMENDATION]->(g)

                ON CREATE SET
                    r.createdAt = datetime()
                SET 
                    r.recommendationScore = game.recommendationScore

            RETURN (p)
        `
        const params = {
            id: userId,
            game: body.games
        }

        const result = await this.neo4jService.getSession().run(query, params)

    }
}
