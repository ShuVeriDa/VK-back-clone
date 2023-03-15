import { returnUserData } from './returnUserData';
import { CommunityEntity } from '../../community/entity/community.entity';

export const returnCommunity = (thing: CommunityEntity) => {
  const members = thing.members?.map((member) => {
    return returnUserData(member);
  });

  const admins = thing.admins?.map((admin) => {
    return returnUserData(admin);
  });

  const posts = thing.posts?.map((post) => {
    delete post.user;
    delete post.comments;
    return post;
  });

  const video = thing.video?.map((v) => {
    delete v.user;
    delete v.comments;
    delete v.videoAdders;
    return v;
  });

  const music = thing.music?.map((m) => {
    delete m.user;
    delete m.musicAdders;
    return m;
  });

  const photos = thing.photos?.map((photo) => {
    delete photo.user;
    delete photo.comments;
    return photo;
  });

  return {
    ...thing,
    members: members,
    posts: posts,
    video: video,
    music: music,
    photos: photos,
    admins: admins,
    author: returnUserData(thing.author),
  };
};
