import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Types } from 'mongoose';

@Controller('/api/auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() authDto: AuthDto): Promise<{ message: string }> {
    console.log(authDto);
    await this.authService.create(authDto);
    return { message: 'Utilisateur crée !' };
  }

  @Post('login')
  async login(
    @Body() authDto: AuthDto,
  ): Promise<Promise<{ userId: Types.ObjectId; token: string }>> {
    const user = await this.authService.getUser(authDto);
    return user;
  }
}
