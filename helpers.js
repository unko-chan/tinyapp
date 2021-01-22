const bcrypt = require('bcrypt');

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

module.exports = { checkDupeEmail, generateRandomString, checkCredentials };
