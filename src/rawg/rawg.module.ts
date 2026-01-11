import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RawgService } from './rawg.service';

@Module({
    imports: [
        HttpModule.register({
            baseURL: "https://api.rawg.io/api",
            timeout: 10_000
        })
    ],
    providers: [RawgService],
    exports: [RawgService]
})
export class RawgModule {}
