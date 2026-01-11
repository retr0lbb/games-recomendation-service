import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Driver, Session } from "neo4j-driver";
import neo4j from "neo4j-driver"


@Injectable()
export class Neo4jService implements OnModuleDestroy{
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

    async onModuleDestroy() {
        await this.driver.close()
    }
}