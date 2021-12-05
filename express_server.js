const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const getUserByEmail = require("./helpers.js");
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['yeti%2Bcoffee%2Btravel%2Bmug&qid=1638664552&'],
}));

app.set("view engine", "ejs");

const generateRandomString = () => {
  let randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const findUserURL = (id) => {
  let userURL = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "123" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "321" }
};

const users = {
  "randomID": {
    id: "randomID",
    email: "user1@email.com",
    password: "123"
  },
  "randomID2": {
    id: "randomID2",
    email: "user2@email.com",
    password: "abc"
  }
};

// SERVER HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});


// SHOW ALL SHORTENED URLS IN DATABASE
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = findUserURL(userID);
  const templateVars = { urls: userURLs, user: users[userID] };

  if (!userID) {
    return res.send("Please log in to see your URLs or register to create an account!");
  }
  res.render("urls_index", templateVars);
});


// NEW SHORT URL LANDING PAGE
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID] };

  if (userID) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


// SHOW SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.user_id;
  const templateVars = { shortURL, longURL, user: users[userID] };

  res.render("urls_show", templateVars);
});


// REGISTRATION PAGE
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID] };

  res.render("registration", templateVars);
});


// INVALID SHORT URL => SEND 404
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Sorry, that page does not exist.");
  }
  res.redirect(urlDatabase[shortURL].longURL);
});


// REGISTER
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const isEmailPasswordEmpty = req.body.email === "" || req.body.password === "";
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (isEmailPasswordEmpty) {
    return res.status(400).send("Sorry, both email and password fields must be completed.");
  }
  if (!getUserByEmail(req.body.email, users)) {
    users[newID] = { id: newID, email: req.body.email, password: hashedPassword };
    req.session.user_id = newID;
    return res.redirect("/urls");
  } else {
    res.status(400).send("Sorry, this email has already been registered.");
  }
});


// CREATE NEW URL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const newKey = generateRandomString();
  urlDatabase[newKey] = { "longURL": req.body.longURL, "userID": userID };

  res.redirect("/urls");
});


// EDIT
app.post("/urls/:shortURL",(req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const allowedURLs = findUserURL(userID);
  
  if (Object.keys(allowedURLs).length === 0) {
    return res.status(403).send("Only the creator of this URL can edit.");
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect("/urls");
});


// LOGIN & SET COOKIE
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID] };

  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  const userID = getUserByEmail(req.body.email, users);

  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Sorry, this email has not been registered.");
  }
  if (!bcrypt.compareSync(req.body.password, users[userID].password)) {
    return res.status(403).send("Sorry, this password is incorrect.");
  }
  
  req.session.user_id = userID;
  res.redirect("/urls");
});


// LOGOUT & DELETE COOKIE
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// DELETE SHORT URL
app.post("/urls/:shortURL/delete",(req, res)=> {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (!userID) {
    return res.status(403).send("Please log in to delete URL.");
  }
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }

  res.status(403).send("Only the creator of this URL can delete it.");
});


// 404 PAGE NOT FOUND
app.use(function(req, res) {
  res.status(404).send("Sorry, that page does not exist.");
});


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

module.exports = users;