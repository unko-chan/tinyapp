const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//require checkDupeEmail(), generateRandomString(), checkCredentials
const helpers = require('./helpers');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['kj32h'],
  })
);

//register function
const register = function (email, password) {
  const id = helpers.generateRandomString();
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

const urlDatabase = {};

const users = {};

//gets all urls owned by user
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

//login logic
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  //runs validation check on credentials
  if (helpers.checkCredentials(email, password, users)) {
    const id = helpers.checkCredentials(email, password, users);
    req.session.user_id = email;
    console.log(req.session.user_id)
    res.redirect(`/urls`);
  } else {
    res.status(403).send('invalid credentials');
  }
});

//logout and clear cookies
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect(`/urls`);
});

//register data
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  //runs check for duplicate emails in DB
  if (helpers.checkDupeEmail(email, users)) {
    res.status(400).send('Duplicate Email');
  } else if (email && password) {                           //hash password and completes
    const hashedPassword = bcrypt.hashSync(password, 10);   //registration if pass
    userId = register(email, hashedPassword);
    req.session.user_id = email;
    res.redirect('/urls');
  } else {
    res.status(400).send('Empty Fields');
  }
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
  shortURL = helpers.generateRandomString();
  const newUrls = {
    [shortURL]: { longURL: req.body.longURL, userID: req.session.user_id },
  };
  Object.assign(urlDatabase, newUrls);                //adds new shortUrl:longUrls pair to urlDatabase
  res.redirect(`urls/`);                              //redirects to the new generated link
});

//deletes
app.post('/urls/:shortURL/delete', (req, res) => {
  const user_id = req.session.user_id;
  shortURL = req.params.shortURL;

  //checks if user has rights to delete
  if (urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send('invalid credentials');
  } else {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }
});

//edit the longURL
app.post('/urls/:shortURL/update', (req, res) => {
  const user_id = req.session.user_id;
  shortURL = req.params.shortURL;

  //checks if user has rights to edit
  if (urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send('invalid credentials');
  } else {
    urlDatabase[shortURL].longURL = req.body.updateUrl;
    res.redirect(`/urls`);
  }
});

//shortened URL's list (main) page
app.get('/urls', (req, res) => {
  let user_id = req.session.user_id
  if (!user_id){
    return res.redirect('/home')
  }
  const urls = urlsForUser(user_id);
  const templateVars = { urls, user_id };
  res.render('urls_index', templateVars);
});

//undefined page
app.get('/u/undefined', (req, res) => {
  res.send('Link does not exist!');
});

//new generator form page
app.get('/urls/new', (req, res) => {
  let user_id = req.session.user_id
  if (!user_id){
    return res.redirect('/home')
  }
  
  //checks if user is logged in
  if (req.session.user_id) {
    const templateVars = { user_id: req.session.user_id };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//shows longURL and shortURL on page
app.get('/urls/:shortURL', (req, res) => {
  let user_id = req.session.user_id
  if (!user_id){
    return res.redirect('/home')
  } 
  const templateVars = {
    shortURL: req.params.shortURL,
    url: urlDatabase,
    user_id: req.session.user_id,
  };
  res.render('urls_show', templateVars);
});

//redirects to longURL from shortURL
app.get('/u/:shortURL', (req, res) => {
  let user_id = req.session.user_id
  if (!user_id){
    return res.redirect('/home')
  }
  const link = urlDatabase[req.params.shortURL].longURL;
  res.redirect(link);
});

//Home page
app.get('/', (req, res) => {
  if (req.session.user_id){
    res.redirect('/urls')
  } else {
    return res.redirect('/home')
  }
});

app.get('/home', (req, res) => {
  templateVars = {user_id: req.session.user_id}
  res.render('home', templateVars)
})

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
- templateVars are variables for the page that is going to be rendered by res.render
*/
