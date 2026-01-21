import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod.pipe';
import { type LoginPayload, loginPayloadSchema } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { type RegisterPayload, registerPayloadSchema } from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post("/login")
    @UseGuards(LocalGuard)
    async login(@Body(new ZodValidationPipe(loginPayloadSchema)) authPayload: LoginPayload){
        const token = await this.authService.validateUser(authPayload)
        return {token} 
    }
    @Post("/register")
    async register(@Body(new ZodValidationPipe(registerPayloadSchema)) registerPayload: RegisterPayload){
        await this.authService.createUser(registerPayload)
    }
}
