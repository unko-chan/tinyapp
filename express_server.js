const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
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

app.set('view engine', 'ejs');

//login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect(`/urls`);
});

//register
app.get('/register', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    username: req.cookies['username'],
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
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_index', templateVars);
});

//undefined page
app.get('/u/undefined', (req, res) => {
  res.send('sorry my guy that link doesnt exist');
});

//new generator form page
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

//shows longURL and shortURL on page
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase,
    username: req.cookies['username'],
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
