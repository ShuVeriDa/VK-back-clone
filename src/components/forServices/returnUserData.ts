export const returnUserData = (data: any) => {
  if (data)
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
    };
};
