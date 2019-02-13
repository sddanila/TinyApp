var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
    let templateVars = { 
      urlDatabase: urlDatabase,
      users: users,
      user_id: req.cookies["user_id"]
     };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urlDatabase: urlDatabase,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  let templateVars = { 
    urlDatabase: urlDatabase,
    shortURL: req.params.shortURL,
    users: users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  // console.log(urlDatabase[shortURL]);
  // console.log(newLongURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { 
    urlDatabase: urlDatabase,
    users: users,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email);
  if (!email || email === "" || !password || password === "" || foundUser){
    res.statusCode = 400;
    console.log(res.statusCode);
    console.log("error... ooopsie...");
    res.redirect("/register");
  } else {
    const id = generateRandomString();
    users[id] = { 
      'id': id,
      'email': email,
      'password': password 
    };
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let userId = findUserByEmail(req.body.email);
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function findUserByEmail(email){
  for (var userID in users){
    if (users[userID].email === email){
      console.log(userID);
      console.log(users);
      return userID;
    };
  }
}