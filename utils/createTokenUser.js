module.exports = (user) => {
  return {
    userId: user._id,
    name: `${user?.firstName} ${user?.lastName}`,
    email: user.email,
    roles: user.roles,
    location: user.location,
    avatar: user.avatar,
  };
};
