const checkDupeEmail = function (email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key].id;
    } 
  }
};

module.exports = { checkDupeEmail }