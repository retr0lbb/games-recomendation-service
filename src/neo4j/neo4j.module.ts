import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jService } from './neo4j.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [Neo4jService],
    exports: [Neo4jService]
})
export class Neo4jModule implements OnModuleDestroy, OnModuleInit {
    constructor(private readonly neo4jService: Neo4jService) {}
    
    async onModuleDestroy() {
        await this.neo4jService.close();
    }

    async onModuleInit() {
        await this.neo4jService.setUp();
    }
}
