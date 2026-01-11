import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class RawgService{
    constructor(private readonly http:HttpService){}

    async getGameById(rawgId: number){
        const response = await firstValueFrom(
            this.http.get(`/games/${rawgId}`, {
                params: {
                    key: process.env.RAWG_API_KEY
                }
            })
        )

        return response.data
    }
}