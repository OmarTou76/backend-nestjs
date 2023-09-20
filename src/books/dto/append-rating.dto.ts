import { IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';
import { User } from 'src/auth/schemas/user.schema';

export class AppendRatingDto {
  @IsNotEmpty()
  @IsString()
  userId: User;

  @IsNotEmpty()
  @IsNumber()
  @Max(5)
  rating: number;
}
