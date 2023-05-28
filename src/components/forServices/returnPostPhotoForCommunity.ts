import { returnUserData } from './returnUserData';
import { PostEntity } from '../../post/entity/post.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';

export const returnPostPhotoForCommunity = (
  thing: any,
  repost?: PostEntity,
  photoRepost?: PhotoEntity,
) => {
  // const members = thing.community?.members.map((member) => {
  //   return returnUserData(member);
  // });
  //
  // const admins = thing.community?.admins.map((admin) => {
  //   return returnUserData(admin);
  // });

  const photoFavorites = thing?.photoFavoriteAdders?.map((user) =>
    returnUserData(user),
  );

  delete thing?.community?.admins;
  delete thing?.community?.members;
  delete thing?.community?.author;
  delete thing?.repostsPhoto?.photoFavoriteAdders;
  delete thing?.repostsPhoto?.comments;
  // delete thing.community?.description;

  return {
    ...thing,
    community: thing?.community ? { ...thing.community } : null,
    // members: members,
    // admins: admins,
    // author: returnUserData(thing.community?.author),
    user: returnUserData(thing?.user),
    photoFavoriteAdders: photoFavorites,
    reposts: repost,
    repostsPhoto: {
      ...thing?.repostsPhoto,
      user: returnUserData(thing?.repostsPhoto?.user),
    },
    // photoRepost: photoRepost,
  };
};
