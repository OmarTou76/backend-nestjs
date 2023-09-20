import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Bcrypt } from 'src/utils/bcrypt';
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
        password: await this._bcrypt.hashPassword(authDto.password),
      });
      return await userCreated.save();
    } catch (error) {
      console.log(error);
      throw new Error("Erreur lors de la création de l 'utilisateur.");
    }
  }

  async getUser(
    authDto: AuthDto,
  ): Promise<{ userId: Types.ObjectId; token: string }> {
    const user = await this.userModel.findOne({
      email: authDto.email,
    });
    if (!user) throw new UnauthorizedException('Email inconnu.');
    else if (
      !(await this._bcrypt.comparePassword(authDto.password, user.password))
    )
      throw new UnauthorizedException('Mot de passe incorrect.');

    return {
      userId: user._id,
      token: await this.jwtService.signAsync({ userId: user._id }),
    };
  }
}
