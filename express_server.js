const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = () => {
  let randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


// SHOW ALL SHORTENED URLS IN DATABASE

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});


// NEW SHORT URL LANDING PAGE

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});


// SHOW SHORT URL PAGE

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});


// REGISTRATION PAGE

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("registration", templateVars);
})


// INVALID SHORT URL => SEND 404

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params.shortURL;
  if (urlDatabase[longURL] === undefined) { // ask mentor to take a look at this
    res.status(404).send("Sorry, that page does not exist.");
  }
  res.redirect(urlDatabase[longURL]);
});


// // HELLO PAGE

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// REGISTER
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  users[newID] = { id: newID, email: req.body.email, password: req.body.password };
  console.log(req.body);
  console.log(users);
});

// CREATE NEW URL

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect("/urls");
});


// EDIT

app.post("/urls/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});


// LOGIN COOKIE

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username); //When we write cookie, there are two values we give, 1. Cookie name 2. Value for that cookie
  res.redirect("/urls");
});


// LOGOUT & DELETE COOKIE

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


// DELETE

app.post("/urls/:shortURL/delete",(req, res)=> {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});


// 404 PAGE NOT FOUND

app.use(function(req, res, next) {
  res.status(404).send("Sorry, that page does not exist.");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});