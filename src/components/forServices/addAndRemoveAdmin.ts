import { AddAdminCommunityDto } from '../../community/dto/addAdmin.dto';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validationCommunity } from './validationCommunity';
import { UserEntity } from '../../user/entity/user.entity';
import { returnCommunity } from './returnCommunity';

export const addAndRemoveAdmin = async (
  dto: AddAdminCommunityDto,
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  flag: 'add' | 'remove',
) => {
  const { community } = await validationCommunity(
    communityId,
    communityRepos,
    userId,
    userRepos,
  );
  const isMember = community.members.find(
    (member) => String(member.id) === dto.memberId,
  );

  if (!isMember) throw new NotFoundException('Member not found');

  const userIsAdmin = community.admins.find(
    (admin) => String(admin.id) === String(userId),
  );

  if (!userIsAdmin) throw new ForbiddenException('You do not have permission');

  if (flag === 'add') {
    const memberIsAdmin = community.admins.find(
      (admin) => String(admin.id) === dto.memberId,
    );

    if (memberIsAdmin)
      throw new ForbiddenException('The member is already an admin');

    await communityRepos.save({
      ...community,
      admins: [...community.admins, { id: dto.memberId }],
    });
  }

  if (flag === 'remove') {
    const memberIsAdmin = community.admins.find(
      (admin) => String(admin.id) === dto.memberId,
    );

    if (!memberIsAdmin) throw new ForbiddenException('The member is not admin');

    community.admins = community.admins.filter(
      (admin) => String(admin.id) !== dto.memberId,
    );
    await communityRepos.save(community);
  }

  const existAdmin = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members', 'admins'],
  });

  delete existAdmin.author.password;

  existAdmin.admins.map((a) => {
    delete a.password;
    return a;
  });

  existAdmin.members.map((m) => {
    delete m.password;
    return m;
  });

  return returnCommunity(existAdmin);
};
