import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import {Request} from "express"
import { JwtPayload } from "../types/jwt-payload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(configurationService: ConfigService){
        const secret = configurationService.get("JWT_SECRET")
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration: false,
            secretOrKey: configurationService.getOrThrow("JWT_SECRET")
        })
    }

    private static extractJWT(req: Request): string | null{
        if(req.cookies && "np-token" in req.cookies && req.cookies["np-token"].length > 0){
            return req.cookies['np-token']
        }
        return null
    }

    validate(payload: JwtPayload) {
        return payload
    }
}