import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { validationOldUser } from '../components/forServices/validationOldUser';
import { genSalt, hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AuthDto) {
    await validationOldUser(dto.email, this);

    const salt = await genSalt(10);

    const user = await this.repository.save({
      email: dto.email,
      password: await hash(dto.password, salt),
      firstName: dto.firstName,
      lastName: dto.lastName,
      isAdmin: dto.isAdmin,
      avatar: dto.avatar,
      status: dto.status,
    });

    const tokens = await this.issueTokenPair(String(user.id));

    try {
      return {
        user: this.returnUserFields(user),
        ...tokens,
      };
    } catch (error) {
      throw new ForbiddenException('Registration error');
    }
  }

  async issueTokenPair(userId: string) {
    const data = { id: userId };

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d',
    });

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1d',
    });

    return { refreshToken, accessToken };
  }

  returnUserFields(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      status: user.status,
    };
  }
}
