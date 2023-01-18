import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

export const validationOldUser = async (
  dto: string,
  authRepository: Repository<UserEntity>,
) => {
  const oldUserEmail = await authRepository.findOneBy({ email: dto });
  if (oldUserEmail) {
    throw new BadRequestException(
      `User with this email is already in the system`,
    );
  }
};
