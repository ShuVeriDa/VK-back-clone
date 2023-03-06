export const returnPostWithUser = (thing: any) => {
  return {
    ...thing,
    user: {
      id: thing.user.id,
      firstName: thing.user.firstName,
      lastName: thing.user.lastName,
      avatar: thing.user.avatar,
    },
  };
};
