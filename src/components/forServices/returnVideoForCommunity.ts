import { returnUserData } from './returnUserData';

export const returnVideoForCommunity = (thing) => {
  // const members = thing.community?.members.map((member) => {
  //   return returnUserData(member);
  // });
  //
  // const admins = thing.community?.admins.map((admin) => {
  //   return returnUserData(admin);
  // });

  const adders = thing.videoAdders?.map((adder) => {
    return returnUserData(adder);
  });

  const communities = thing.communities?.map((community) => {
    delete community.admins;
    delete community.members;
    delete community.author;

    // delete community.description;

    return community;
  });

  return {
    ...thing,
    communities: thing.communities?.length ? communities : null,
    user: returnUserData(thing.user),
    videoAdders: adders,
  };
};
