import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Bcrypt } from 'src/utils/bcrypt';
import { randomUUID } from 'crypto';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private _bcrypt: Bcrypt;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    this._bcrypt = new Bcrypt();
  }

  async create(authDto: AuthDto): Promise<User> {
    const alreadyExist = await this.userModel.findOne({
      email: authDto.email,
    });
    if (alreadyExist)
      throw new ConflictException(
        `Cet email (${authDto.email}) est deja utilisé.`,
      );
    try {
      const userCreated = new this.userModel({
        ...authDto,
        userId: randomUUID(),
        password: await this._bcrypt.hashPassword(authDto.password),
      });
      return await userCreated.save();
    } catch (error) {
      throw new Error("Erreur lors de la création de l 'utilisateur.");
    }
  }

  async getUser(authDto: AuthDto): Promise<Record<string, string>> {
    const user = await this.userModel.findOne({
      email: authDto.email,
    });
    if (!user) throw new UnauthorizedException('Email inconnu.');
    else if (
      !(await this._bcrypt.comparePassword(authDto.password, user.password))
    )
      throw new UnauthorizedException('Mot de passe incorrect.');

    return {
      userId: user.userId,
      token: await this.jwtService.signAsync({ userId: user.userId }),
    };
  }
}
