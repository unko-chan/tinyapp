//TODO LIST:
//fix registration object assigning DONE
//implement better logic at finding userID when logging in DONE
//finish login route ||  need to return ID
const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const checkCredentials = function (credentials, type) {
  for (const key in users) {
    if (users[key][type] === credentials) {
      return key
    } 
  }
};

const register = function (email, password) {
  const id = generateRandomString();
  // const userEmail = email;
  // const userPassword = password;

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
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.set('view engine', 'ejs');

//login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (
    checkCredentials(email, 'email') &&
    checkCredentials(password, 'password')
    ) {
      id = checkCredentials(email, 'email')
    res.cookie('user_id', id);
    res.redirect(`/urls`);
    console.log('valid login');
  } else {
    res.status(403).send('invalid credentials');
    console.log('invalid login');
  }

});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.body.user_id);
  res.redirect(`/urls`);
});

//register data
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (checkCredentials(email, 'email')) {
    res.status(400).send('Duplicate Email');
  } else if (email && password) {
    userId = register(email, password);
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    res.status(400).send('Empty Fields');
  }
  console.log(users);
});

//register page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
  };
  res.render('register', templateVars);
});

//login page
app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
  };
  res.render('login', templateVars);
});

//Creates and stores new generated shortened links
app.post('/urls', (req, res) => {
  const newUrls = {};
  shortURL = generateRandomString();
  newUrls[shortURL] = req.body.longURL; //adds the new generated string & longURL to newUrls
  Object.assign(urlDatabase, newUrls); //adds new shortUrl:longUrls pair to urlDatabase
  console.log(urlDatabase);
  res.redirect(`urls/${shortURL}`); //redirects to the new generated link
});

//deletes
app.post('/urls/:shortURL/delete', (req, res) => {
  shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

//updates the longURL
app.post('/urls/:shortURL/update', (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updateUrl;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

//shortened URL's list (main) page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render('urls_index', templateVars);
});

//undefined page
app.get('/u/undefined', (req, res) => {
  res.send('sorry my guy that link doesnt exist');
});

//new generator form page
app.get('/urls/new', (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'] };
  res.render('urls_new', templateVars);
});

//shows longURL and shortURL on page
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    user_id: req.cookies['user_id'],
  };
  res.render('urls_show', templateVars);
});

//redirects to longURL from shortURL
app.get('/u/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
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
- Creating User Login/Registration logic
- templateVars for variables for the page that is going to be rendered by res.render

