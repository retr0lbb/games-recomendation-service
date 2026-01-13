import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Driver, Session } from "neo4j-driver";
import neo4j from "neo4j-driver"


@Injectable()
export class Neo4jService{
    private driver: Driver

    constructor(private configService: ConfigService) {
        console.log(`URI ${configService.get<string>('NEO4J_URI')}`)
        this.driver = neo4j.driver(
        this.configService.get<string>('NEO4J_URI') ?? "",
            neo4j.auth.basic(
                this.configService.get<string>('NEO4J_USER') ?? "",
                this.configService.get<string>('NEO4J_PASSWORD')?? "",
            ),
        );
    }
    
    getSession(): Session{
        return this.driver.session()
    }

    async close(){
        await this.driver.close()
    }

    async setUp(){

        const query1 = `
            CREATE CONSTRAINT game_id_unique IF NOT EXISTS
            FOR (g:Game)
            REQUIRE g.id IS UNIQUE;
        `
        const query2 = `
            CREATE CONSTRAINT player_username_unique IF NOT EXISTS
            FOR (p:Player)
            REQUIRE p.name IS UNIQUE;
        `

        const session = this.getSession();
        const tx = session.beginTransaction();
        try {
            await tx.run(query1);
            await tx.run(query2);
            await tx.commit();
        } catch (e) {
            await tx.rollback();
            throw e;
        } finally {
            await session.close();
        }
    }

}