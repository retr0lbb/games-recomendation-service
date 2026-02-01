import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { JwtModule } from '@nestjs/jwt';
import {PassportModule} from "@nestjs/passport"
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [Neo4jModule, PassportModule,  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.getOrThrow("JWT_SECRET"),
      signOptions: { expiresIn: "1d" }
    })
  })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
