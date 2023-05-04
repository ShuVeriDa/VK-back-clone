import { returnUserData } from './returnUserData';
import { AlbumEntity } from '../../photo/entity/album.entity';

export const returnAlbum = (thing: AlbumEntity) => {
  return {
    ...thing,
    user: returnUserData(thing.user),
    photos: thing.photos.map((photo) => {
      return {
        id: photo.id,
        description: photo.description,
        photoUrl: photo.photoUrl,
      };
    }),
  };
};
