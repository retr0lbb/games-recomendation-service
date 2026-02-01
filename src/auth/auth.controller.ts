import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod.pipe';
import { AuthService } from './auth.service';
import { type RegisterPayload, registerPayloadSchema } from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post("/login")
    @UseGuards(LocalGuard)
    async login(@Req() req: Request, @Res({passthrough: true}) res: Response){
        const token = req.user

        res.cookie("np-token", token, {
            httpOnly: true,
            secure: false,      
            sameSite: "lax",
            maxAge: 1000 * 60 * 60,
        });
        return {token: req.user}
    }

    @Post("/register")
    async register(@Body(new ZodValidationPipe(registerPayloadSchema)) registerPayload: RegisterPayload){
        await this.authService.createUser(registerPayload)
    }

    @Get("/status")
    @UseGuards(JwtAuthGuard)
    async status(@Req() req: Request){
        console.log("🍪 COOKIES NO CONTROLLER:", req.cookies);
        return req.user
    }
}
