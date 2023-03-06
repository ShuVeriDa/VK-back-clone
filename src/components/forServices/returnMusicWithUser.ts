import { returnUserData } from './returnUserData';
import { MusicEntity } from '../../music/entity/music.entity';

export const returnMusicWithUser = (thing: MusicEntity) => {
  const adders = thing.musicAdders.map((adder) => {
    return returnUserData(adder);
  });

  return {
    ...thing,
    user: returnUserData(thing.user),
    musicAdders: adders,
  };
};
