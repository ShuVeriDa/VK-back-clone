import { returnUserData } from './returnUserData';
import { PostEntity } from '../../post/entity/post.entity';

export const returnPostPhotoForCommunity = (thing: any) => {
  // const members = thing.community?.members.map((member) => {
  //   return returnUserData(member);
  // });
  //
  // const admins = thing.community?.admins.map((admin) => {
  //   return returnUserData(admin);
  // });

  delete thing.community?.admins;
  delete thing.community?.members;
  delete thing.community?.author;
  // delete thing.community?.description;

  return {
    ...thing,
    community: thing.community ? { ...thing.community } : null,
    // members: members,
    // admins: admins,
    // author: returnUserData(thing.community?.author),
    user: returnUserData(thing.user),
  };
};
