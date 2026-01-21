import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from "passport-local"
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local"){
    constructor(private readonly authService: AuthService){
        super({usernameField: "email"})
    }

    async validate(email: string, password: string) {
        const token = await this.authService.validateUser({email, password})
        if(!token){
            throw new UnauthorizedException()
        }
        return token
    }
}