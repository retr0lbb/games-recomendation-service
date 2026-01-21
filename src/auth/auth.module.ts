import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [Neo4jModule, JwtModule.register({
    secret: "furry-change-later",
    signOptions: {expiresIn: '2h'}
  })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
