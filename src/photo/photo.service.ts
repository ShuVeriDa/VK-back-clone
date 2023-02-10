import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { UpdatePhotoDto } from './dto/update.dto';
import { CommunityEntity } from '../community/entity/community.entity';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { FetchPhotoDto } from './dto/fetch.dto';
import { validationCommunity } from '../components/forServices/validationCommunity';

@Injectable()
export class PhotoService {
  @InjectRepository(PhotoEntity)
  private readonly photoRepository: Repository<PhotoEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

  async getAll(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['music'],
    });

    if (!user) throw new NotFoundException('User not found');

    const photos = await this.photoRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    photos.map((p) => {
      delete p.user.password;
      return p;
    });
    return photos;
  }

  async getOne(photoId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      relations: ['community'],
    });

    if (!photo) throw new NotFoundException('Photo not found');

    delete photo.user.password;
    delete photo?.community.members;
    delete photo?.community.author;

    photo?.community.admins.map((admin) => {
      delete admin.password;
      return admin;
    });

    return photo;
  }

  async create(dto: CreatePhotoDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const photo = await this.photoRepository.save({
      user: { id: userId },
    });

    return this.getOne(photo.id);
  }

  async update(dto: UpdatePhotoDto, photoId: string, userId: string) {
    const photo = await this.getOne(photoId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = photo.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this photo");

    await this.photoRepository.update(
      { id: photo.id },
      { description: dto.description },
    );

    return await this.getOne(photo.id);
  }

  async delete(photoId: string, userId: string) {
    const photo = await this.getOne(photoId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = photo.user.id === userId;

    const isCommunity = photo.community; // null

    if (!isAuthor || isCommunity)
      throw new ForbiddenException("You don't have access to this photo");

    await this.photoRepository.delete(photo.id);
  }

  // FOR COMMUNITY
  async getAllInCommunity(dto: FetchPhotoDto) {
    const { community } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    const photos = await this.photoRepository.find({
      where: { community: { id: community.id } },
      relations: ['community'],
    });

    return photos.map((photo) => {
      photo.community.admins.map((admin) => {
        delete admin.password;
        return admin;
      });
      delete photo.community.author;
      delete photo.community.members;
      delete photo.user.password;

      return photo;
    });

    // return community.photos.map((photo) => {
    //   delete photo.user.password;
    //   // delete photo.community.author;
    //   // delete photo.community.members;
    //
    //   // photo.community.admins.map((admin) => {
    //   //   delete admin.password;
    //   //   return admin;
    //   // });
    //
    //   return photo;
    // }
    // );
  }

  async getOneInCommunity(dto: FetchPhotoDto, photoId: string) {
    const photo = await this.getOne(photoId);

    const { community, user } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    return photo;
  }
  async createInCommunity(dto: CreatePhotoDto, userId: string) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const photo = await this.photoRepository.save({
      user: { id: user.id },
      community: { id: community.id },
    });

    return await this.getOne(photo.id);
  }
}
