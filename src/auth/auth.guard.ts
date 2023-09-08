import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      const user = await this.jwtService.verifyAsync(token);
      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException('Token attendu.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers['authorization'].split(' ');
    return type == 'Bearer' ? token : '';
  }
}
