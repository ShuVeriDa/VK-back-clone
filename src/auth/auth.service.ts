import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { validationOldUser } from '../components/forServices/validationOldUser';
import { compare, genSalt, hash } from 'bcryptjs';
import { LoginDto } from '../user/dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { returnUserData } from '../components/forServices/returnUserData';
import { returnCommunityForUser } from '../components/forServices/returnCommunityForUser';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const tokens = await this.issueTokenPair(String(user.id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in');

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Invalid token or expired');

    const user = await this.authRepository.findOneBy({ id: result.id });

    const tokens = await this.issueTokenPair(String(user.id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async validateUser(dto: LoginDto) {
    const user = await this.authRepository.findOne({
      where: {
        email: dto.email,
      },
      relations: ['friends', 'communities'],
    });

    if (!user) throw new UnauthorizedException('User not found');

    const isValidPassword = await compare(dto.password, user.password); // сравнение пароля который пришел из LoginDto с паролемя который находится в базе данных
    if (!isValidPassword) throw new UnauthorizedException('Invalid password');

    return user;
  }
  async register(dto: AuthDto) {
    await validationOldUser(dto.email, this.authRepository);

    const salt = await genSalt(10);

    const user = await this.authRepository.save({
      email: dto.email,
      password: await hash(dto.password, salt),
      firstName: dto.firstName,
      lastName: dto.lastName,
      isAdmin: dto.isAdmin,
      avatar: dto.avatar,
      status: dto.status,
      location: dto.location,
    });

    const tokens = await this.issueTokenPair(String(user.id));

    try {
      return {
        user: this.returnUserFields(user),
        ...tokens,
      };
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Registration error', error);
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
    const friends = user.friends?.map((friend) => returnUserData(friend));
    const communities = user.communities?.map((community) =>
      returnCommunityForUser(community),
    );
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      status: user.status,
      location: user.location,
      friends: friends,
      communities: communities,
    };
  }
}
