import { BadRequestException } from '@nestjs/common';

export const validationOldUser = async (dto: string, repos) => {
  const oldUserEmail = await repos.repository.findOneBy({ email: dto });
  if (oldUserEmail) {
    throw new BadRequestException(
      `User with this email is already in the system`,
    );
  }
};
