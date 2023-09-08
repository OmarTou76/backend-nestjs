import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('/api/auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() authDto: AuthDto) {
    await this.authService.create(authDto);
    return { message: 'Utilisateur crée !' };
  }

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    const user = await this.authService.getUser(authDto);
    return user;
  }
}
