import { returnUserData } from './returnUserData';
import { MusicEntity } from '../../music/entity/music.entity';

export const returnMusicForCommunity = (thing) => {
  // const members = thing.community?.members.map((member) => {
  //   return returnUserData(member);
  // });
  //
  // const admins = thing.community?.admins.map((admin) => {
  //   return returnUserData(admin);
  // });

  const adders = thing.musicAdders?.map((adder) => {
    return returnUserData(adder);
  });

  const communities = thing.communities.map((community) => {
    delete community.admins;
    delete community.members;
    delete community.author;

    // delete community.description;

    return community;
  });

  return {
    ...thing,
    communities: communities,
    user: returnUserData(thing.user),
    musicAdders: adders,
  };
};
