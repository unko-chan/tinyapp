const bcrypt = require('bcrypt');

const urlDatabase = {};

const users = {};

const checkDupeEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key].id;
    }
  }
};

const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const checkCredentials = function (email, password, database) {
  for (const key in database) {
    if (
      database[key].email === email &&
      bcrypt.compareSync(password, database[key].password)
    ) {
      return key;
    }
  }
};

const register = function (email, password) {
  const id = generateRandomString();
  const newUser = {
    [id]: {
      id,
      email,
      password,
    },
  };
  Object.assign(users, newUser);
  return id;
};

module.exports = {
  checkDupeEmail,
  generateRandomString,
  checkCredentials,
  register,
  urlDatabase,
  users,
};
