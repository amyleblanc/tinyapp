const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  let randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
   };
  return randomString;
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// NEW SHORT URL LANDING PAGE

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// SHOW SHORT URL PAGE

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  const templateVars = { shortURL, longURL }
  res.render("urls_show", templateVars);
});


// INVALID SHORT URL => SEND 404

app.get("/u/:shortURL", (req, res) => {
  const longURL = req.params.shortURL;
  if (urlDatabase[longURL] === undefined) { // ask mentor to take a look at this
    res.status(404).send("Sorry, that page does not exist.");
  };
  res.redirect(urlDatabase[longURL]);
});


// // HELLO PAGE

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// CREATE NEW URL

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect("/urls");
});


// EDIT

app.post("/urls/:shortURL",(req, res)=>{
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});


// DELETE

app.post("/urls/:shortURL/delete",(req, res)=>{
  const shortURL = req.params.shortURL;  
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});


// 404 PAGE NOT FOUND

app.use(function (req, res, next) {
  res.status(404).send("Sorry, that page does not exist.");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});