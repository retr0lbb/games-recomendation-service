import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import bcrypt from "bcrypt"
import type { LoginPayload } from './dto/auth.dto';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterPayload } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor (private readonly neo4j: Neo4jService, private readonly jwt: JwtService) {}
    async validateUser(authPayload: LoginPayload){

        const searchQuery = `
            MATCH(p:Player) 
            WHERE p.email = $email
            RETURN p 
        `

        const searchParams = {
            email: authPayload.email
        }
        const response = await this.neo4j.getSession().run(searchQuery, searchParams)


        if(!response.records || response.records.length === 0){
            throw new HttpException("User Not Found", HttpStatus.NOT_FOUND)
        }

        const user = response.records[0].get("p").properties


        if(!user){
            throw new HttpException("User Not Found", HttpStatus.NOT_FOUND)
        }

        if(!await bcrypt.compare(authPayload.password, user.password)){
            throw new HttpException("password not correct", HttpStatus.BAD_REQUEST)
        }

        const token = this.jwt.sign({id: user.id, userName: user.username})

        return token

    }

    async createUser(registerPayload: RegisterPayload){

        const session = this.neo4j.getSession()

        const existingUserResults = await session
          .run("MATCH(p:Player) WHERE p.email = $email RETURN p", {email: registerPayload.email})

        if(existingUserResults.records.length > 0 && existingUserResults.records[0].get("p") !== null){
            throw new HttpException("user already exists", HttpStatus.BAD_REQUEST)
        }

        const query = `
            MERGE(p:Player {id: $id})
            SET 
              p.username = $username,
              p.email = $email,
              p.password = $password
        `

        const hashedUserPassword = await bcrypt.hash(registerPayload.password, 10)

        const params = {
            id: crypto.randomUUID(),
            username: registerPayload.userName,
            email: registerPayload.email,
            password: hashedUserPassword
        }

        await session.run(query, params)

        await session.close()
    }
}
