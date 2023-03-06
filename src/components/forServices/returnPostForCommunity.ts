import { returnUserData } from './returnUserData';

export const returnPostForCommunity = (thing: any) => {
  const members = thing.community?.members.map((member) => {
    return returnUserData(member);
  });

  const admins = thing.community?.admins.map((admin) => {
    return returnUserData(admin);
  });

  return {
    ...thing,
    community: {
      ...thing.community,
      members: members,
      admins: admins,
      author: returnUserData(thing.community?.author),
    },
    user: returnUserData(thing.user),
  };
};
