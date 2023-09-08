import { ConflictException, Injectable } from '@nestjs/common';
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

  async create(signUpDto: AuthDto): Promise<User> {
    try {
      const alreadyExist = await this.userModel.findOne({
        email: signUpDto.email,
      });
      if (alreadyExist)
        throw new ConflictException(
          `Cet email (${signUpDto.email}) est deja utilisé.`,
        );
      const userCreated = new this.userModel({
        ...signUpDto,
        userId: randomUUID(),
        password: await this._bcrypt.hashPassword(signUpDto.password),
      });
      return await userCreated.save();
    } catch (error) {
      throw new Error("Erreur lors de la création de l 'utilisateur.");
    }
  }

  async getUser(signUpDto: AuthDto): Promise<User> {
    const user = await this.userModel.findOne({
      email: signUpDto.email,
    });
    if (!user) throw new ConflictException('Email inconnu.');
    try {
      const userCreated = new this.userModel({
        ...signUpDto,
        userId: randomUUID(),
        password: await this._bcrypt.hashPassword(signUpDto.password),
      });
      return await userCreated.save();
    } catch (error) {
      throw new Error("Erreur lors de la création de l 'utilisateur.");
    }
  }
}
