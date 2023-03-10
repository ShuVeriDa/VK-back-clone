import { returnUserData } from './returnUserData';
import { VideoEntity } from '../../video/entity/video.entity';

export const returnVideoWithUser = (thing: VideoEntity) => {
  const adders = thing.videoAdders.map((adder) => {
    return returnUserData(adder);
  });

  return {
    ...thing,
    user: returnUserData(thing.user),
    videoAdders: adders,
  };
};
