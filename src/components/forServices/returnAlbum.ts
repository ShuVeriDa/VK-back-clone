import { returnUserData } from './returnUserData';

export const returnAlbum = (thing: any) => {
  return {
    ...thing,
    user: returnUserData(thing.user),
    photos: thing.photos.map((photo) => {
      return {
        id: photo.id,
        photoUrl: photo.photoUrl,
      };
    }),
  };
};
