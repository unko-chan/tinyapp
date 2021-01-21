const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const checkEmail = function (email) {
  for (const key in users) {
    if (users[key]['email'] === email) {
      console.log(email);
      return true;
    }
  }
};

const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  res.cookie('user_id', req.body.user_id);
  res.redirect(`/urls`);
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.body.user_id);
  res.redirect(`/urls`);
});

//register data
app.post('/register', (req, res) => {
  const newUser = {};
  if (checkEmail(req.body.email)) {
    res.status(400).send('Duplicate Email');
  } else if (req.body.email && req.body.password) {
    newUser['id'] = generateRandomString();
    newUser['email'] = req.body.email;
    newUser['password'] = req.body.password;
    Object.assign(users, newUser);
    res.cookie('user_id', newUser['id']);
    res.redirect('/urls');
  } else {
    res.status(400).send('Empty Fields');
  }
  console.log(users)
});

//register page
app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
  };
  res.render('register', templateVars);
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
