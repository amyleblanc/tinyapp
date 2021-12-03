const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

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

const checkEmail = (emailAddress) => {
  for (const id in users) {
    if (users[id].email === emailAddress) {
      return users[id].id;
    }
  }
  return false;
};

const checkPassword = (password) => {
  for (const id in users) {
    if (users[id].password === password) {
      return true;
    }
  }
  return false;
};


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "" }
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
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render("urls_index", templateVars);
});


// NEW SHORT URL LANDING PAGE
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userID] };
  if (userID) {
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


// SHOW SHORT URL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies["user_id"];
  const templateVars = { shortURL, longURL, user: users[userID] };

  res.render("urls_show", templateVars);
});


// REGISTRATION PAGE
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userID] };

  res.render("registration", templateVars);
});


// INVALID SHORT URL => SEND 404
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.status(404).send("Sorry, that page does not exist.");
  }
  res.redirect(urlDatabase[shortURL].longURL);
}
);


// // HELLO PAGE
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// REGISTER
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Sorry, both email and password fields must be completed.");
  }
  
  if (!checkEmail(req.body.email)) {
    users[newID] = { id: newID, email: req.body.email, password: req.body.password };
    res.cookie("user_id", newID);
    res.redirect("/urls");
  } else {
    res.status(400).send("Sorry, this email has already been registered.");
  }
});


// CREATE NEW URL
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const newKey = generateRandomString();
  urlDatabase[newKey] = { "longURL": req.body.longURL, "userID": userID };
  
  res.redirect("/urls");
});


// EDIT
app.post("/urls/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});


// LOGIN & SET COOKIE
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userID] };

  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  if (!checkEmail(req.body.email)) {
    res.status(403).send("Sorry, this email has not been registered.");
  }
  if (!checkPassword(req.body.password)) {
    res.status(403).send("Sorry, this password is incorrect.");
  }
  
  const userID = checkEmail(req.body.email);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});


// LOGOUT & DELETE COOKIE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


// DELETE
app.post("/urls/:shortURL/delete",(req, res)=> {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});


// 404 PAGE NOT FOUND
app.use(function(req, res) {
  res.status(404).send("Sorry, that page does not exist.");
});


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});