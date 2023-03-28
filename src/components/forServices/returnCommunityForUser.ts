import { CommunityEntity } from '../../community/entity/community.entity';

export const returnCommunityForUser = (community: CommunityEntity) => {
  if (community) {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      imageUrl: community.imageUrl,
    };
  }
};
