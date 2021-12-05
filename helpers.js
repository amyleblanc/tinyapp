const getUserByEmail = (emailAddress, database) => {
  for (const id in database) {
    if (database[id].email === emailAddress) {
      return database[id].id;
    }
  }
  return false;
};

module.exports = getUserByEmail;