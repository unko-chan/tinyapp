const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['abcd'],
}));

const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const checkCredentials = function (email, password) {
  for (const key in users) {
    if (
      users[key].email === email &&
      bcrypt.compareSync(password, users[key].password)
    ) {
      return key;
    }
  }
};

const checkDupeEmail = function (email) {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
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

const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@user.com',
    password: '123',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const urlsForUser = (id) => {
  const userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      Object.assign(userUrls, { [key]: urlDatabase[key] });
    }
  }
  return userUrls;
};

app.set('view engine', 'ejs');

//login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (checkCredentials(email, password)) {
    const id = checkCredentials(email, password);
    req.session.user_id = id;
    res.redirect(`/urls`);
  } else {
    res.status(403).send('invalid credentials');
  }
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect(`/urls`);
});

//register data
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (checkDupeEmail(email)) {
    res.status(400).send('Duplicate Email');
  } else if (email && password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    userId = register(email, hashedPassword);
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.status(400).send('Empty Fields');
  }
  console.log(users);
});

//register page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  res.render('register', templateVars);
});

//login page
app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  res.render('login', templateVars);
});

//Creates and stores new generated shortened links
app.post('/urls', (req, res) => {
  shortURL = generateRandomString();
  const newUrls = {
    [shortURL]: { longURL: req.body.longURL, userID: req.session.user_id },
  };
  Object.assign(urlDatabase, newUrls); //adds new shortUrl:longUrls pair to urlDatabase
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`); //redirects to the new generated link
});

//deletes
app.post('/urls/:shortURL/delete', (req, res) => {
  const user_id = req.session.user_id;
  shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send('invalid credentials');
  } else {
    delete urlDatabase[shortURL];
    console.log(urlDatabase);
    res.redirect(`/urls`);
  }
});

//edit the longURL
app.post('/urls/:shortURL/update', (req, res) => {
  const user_id = req.session.user_id;
  shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send('invalid credentials');
  } else {
    urlDatabase[shortURL].longURL = req.body.updateUrl;
    console.log(urlDatabase);
    res.redirect(`/urls`);
  }
});

//shortened URL's list (main) page
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id);
  const templateVars = { urls, user_id };
  res.render('urls_index', templateVars);
});

//undefined page
app.get('/u/undefined', (req, res) => {
  res.send('sorry my guy that link doesnt exist');
});

//new generator form page
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user_id: req.session.user_id };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//shows longURL and shortURL on page
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    url: urlDatabase,
    user_id: req.session.user_id,
  };
  res.render('urls_show', templateVars);
});

//redirects to longURL from shortURL
app.get('/u/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  const link = urlDatabase[req.params.shortURL].longURL;
  res.redirect(link);
});

//Home page
app.get('/', (req, res) => {
  res.send('Hello!');
});

//json of urlDatabase
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* what I've learned:

- Security concerns on storing passwords as plain text
- Accessing cookies
- Make sure to always require the right modules
- Creating Modular User Login/Registration logic
- templateVars for variables for the page that is going to be rendered by res.render
*/
