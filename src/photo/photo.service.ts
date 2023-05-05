import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './photoDto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { UpdatePhotoDto } from './photoDto/update.dto';
import { CommunityEntity } from '../community/entity/community.entity';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { FetchPhotoDto } from './photoDto/fetch.dto';
import { validationCommunity } from '../components/forServices/validationCommunity';
import { VideoEntity } from '../video/entity/video.entity';
import { returnUserData } from '../components/forServices/returnUserData';
import { returnPostPhotoForCommunity } from '../components/forServices/returnPostPhotoForCommunity';
import { AlbumEntity } from './entity/album.entity';
import { CreateAlbumDto } from './albumDto/create.dto';
import { UpdateAlbumDto } from './albumDto/update.dto';
import { AddPhotoToAlbum } from './albumDto/addPhotoToAlbum.dto';
import { returnAlbum } from '../components/forServices/returnAlbum';

@Injectable()
export class PhotoService {
  @InjectRepository(PhotoEntity)
  private readonly photoRepository: Repository<PhotoEntity>;

  @InjectRepository(AlbumEntity)
  private readonly albumRepository: Repository<AlbumEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

  //albums
  async getAllAlbum(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const albums = await this.albumRepository.find({
      where: { user: { id: user.id } },
      relations: ['photos'],
      order: { createdAt: 'DESC' },
    });

    return albums.map((p) => {
      return returnAlbum(p);
    });
  }

  async getOneAlbum(albumId: string, userId: string) {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['photos'],
    });

    if (!album) throw new NotFoundException('Album not found');
    console.log(album);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    const isMe = album.user.id === user.id;

    if (album.turnOffWatching === 'friends') {
      const isFriend = user.friends.some(
        (friend) => friend.id === album.user.id,
      );

      if (!isFriend && !isMe)
        throw new ForbiddenException(
          'This album can only be viewed by friends',
        );
    }

    if (album.turnOffWatching === 'me') {
      const isMe = album.user.id === user.id;

      if (!isMe)
        throw new ForbiddenException(
          'This album can only be viewed by the owner of this album',
        );
    }

    return returnAlbum(album);
  }

  async createAlbum(dto: CreateAlbumDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const album = await this.albumRepository.save({
      title: dto.title,
      description: dto.description,
      turnOffWatching: dto.turnOffWatching,
      photos: [] as PhotoEntity[],
      user: user,
    });

    return {
      ...album,
      user: returnUserData(album.user),
    };
  }

  async createPhoto(albumId: string, photoDto: CreatePhotoDto, userId: string) {
    const photo = await this.create(photoDto, userId);

    await this.addPhotoToAlbum(albumId, { photoId: photo.id }, userId);

    return photo;
  }

  async updateAlbum(dto: UpdateAlbumDto, albumId: string, userId: string) {
    const album = await this.getOneAlbum(albumId, userId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = album.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this album");

    await this.albumRepository.update(
      { id: album.id },
      {
        title: dto.title,
        description: dto.description,
        turnOffWatching: dto.turnOffWatching,
      },
    );

    return await this.getOneAlbum(album.id, userId);
  }

  async deleteAlbum(albumId: string, userId: string) {
    await this.albumRepository.manager.transaction(async (manager) => {
      const album = await manager.findOne(AlbumEntity, {
        where: { id: albumId },
        // relations: ['photos'],
      });

      if (!album) throw new NotFoundException('Album not found');

      const isCommunity = album.photos;

      const isAuthor = album.user.id === userId;

      // if (!isAuthor || isCommunity) {
      if (!isAuthor) {
        throw new ForbiddenException("You don't have access to this album");
      }
      //
      const photos = album.photos;
      for (const photo of photos) {
        await manager.remove(photo);
      }

      await manager.remove(album);
    });
  }

  async addPhotoToAlbum(albumId: string, dto: AddPhotoToAlbum, userId: string) {
    const album = await this.getOneAlbum(albumId, userId);

    const photo = await this.getOne(dto.photoId);

    // const album = await this.albumRepository.findOne({
    //   where: { id: albumId },
    //   relations: ['photos'],
    // });

    const isExist = album.photos.some((photo) => photo.id === dto.photoId);

    if (isExist) {
      throw new ForbiddenException('This photo already exists in this album');
    }

    await this.albumRepository.save({
      ...album,
      photos: [...album.photos, photo],
    });

    return await this.getOneAlbum(albumId, userId);
  }

  async removePhotoToAlbum(
    albumId: string,
    dto: AddPhotoToAlbum,
    userId: string,
  ) {
    const album = await this.getOneAlbum(albumId, userId);

    const photo = await this.getOne(dto.photoId);

    // const album = await this.albumRepository.findOne({
    //   where: { id: albumId },
    //   relations: ['photos'],
    // });

    const isRights = album.user.id === userId;

    if (!isRights)
      throw new ForbiddenException('You do not have rights to this album');

    const isExist = album.photos.some((p) => p.id === photo.id);

    if (!isExist) {
      throw new ForbiddenException('This photo is no longer in this album.');
    }

    album.photos = album.photos.filter((photo) => photo.id !== dto.photoId);

    await this.albumRepository.save(album);

    return await this.getOneAlbum(albumId, userId);
  }

  //photos
  async getAll(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['music'],
    });

    if (!user) throw new NotFoundException('User not found');

    const photos = await this.photoRepository.find({
      where: { user: { id: user.id } },
      relations: ['community'],
      order: { createdAt: 'DESC' },
    });

    return photos.map((p) => {
      return returnPostPhotoForCommunity(p);
    });
  }

  async getOne(photoId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      relations: ['community'],
    });

    if (!photo) throw new NotFoundException('Photo not found');

    return returnPostPhotoForCommunity(photo);
  }

  async create(dto: CreatePhotoDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const photo = await this.photoRepository.save({
      photoUrl: dto.photoUrl,
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
    await this.photoRepository.manager.transaction(async (manager) => {
      const photo = await manager.findOne(PhotoEntity, {
        where: { id: photoId },
        relations: ['community'],
      });

      if (!photo) throw new NotFoundException('Photo not found');

      const isCommunity = photo.community;

      const isAuthor = photo.user.id === userId;

      if (!isAuthor || isCommunity) {
        throw new ForbiddenException("You don't have access to this video");
      }

      const comments = photo.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(photo);
    });
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
      return returnPostPhotoForCommunity(photo);
    });
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
      photoUrl: dto.photoUrl,
      user: { id: user.id },
      community: { id: community.id },
    });

    return await this.getOne(photo.id);
  }

  async updateInCommunity(
    dto: UpdatePhotoDto,
    photoId: string,
    userId: string,
  ) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const photo = community.photos.find((photo) => photo.id === photoId);

    if (!photo)
      throw new NotFoundException('Photo not found in this community');

    await this.photoRepository.update(
      {
        id: photo.id,
      },
      {
        description: dto.description,
      },
    );

    return await this.getOne(photo.id);
  }

  async deleteInCommunity(photoId: string, userId: string) {
    await this.photoRepository.manager.transaction(async (manager) => {
      const photo = await manager.findOne(PhotoEntity, {
        where: { id: photoId },
        relations: ['community'],
      });

      if (!photo) throw new NotFoundException('Photo not found');

      const { community, user } = await validationCRUDInCommunity(
        photo.community.id,
        this.communityRepository,
        userId,
        this.userRepository,
        true,
      );

      const comments = photo.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(photo);
    });
  }
}
