var express = require("express");
var bodyParser = require("body-parser");
var app = express();
// var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  // keys: [/* secret keys */],
  secret: 'Expecto patronum',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: "password"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: "password"
  }
}

app.get("/", (req, res) => {
  let templateVars = { 
    urlDatabase: urlDatabase,
    users: users,
    user_id: req.session.user_id
   };
  res.render("urls_welcome", templateVars);
});

app.get("/urls", (req, res) => {  
  if(isLoggedIn(req.session.user_id)){
    let templateVars = { 
        urlDatabase: urlDatabase,
        users: users,
        user_id: req.session.user_id
       };
       checkUrlOwnership(req.session.user_id);
       res.render("urls_index", templateVars);
     } else {
       res.redirect("/");
     }
  });

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urlDatabase: urlDatabase,
    user_id: req.session.user_id
  };
  if(isLoggedIn(req.session.user_id)){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  // console.log(urlDatabase);
  res.redirect(`/urls/${randomURL}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:shortURL", (req, res) => {
  if(isLoggedIn(req.session.user_id)){
    let templateVars = { 
      urlDatabase: urlDatabase,
      shortURL: req.params.shortURL,
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(req.body.newLongURL);
  urlDatabase[shortURL] = {
    longURL: req.body.newLongURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { 
    urlDatabase: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const foundUser = findUserByEmail(email);
  if (!email || email === "" || !password || password === "" || foundUser){
    res.send(400, "error... ooopsie...");
    res.redirect("/register");
  } else {
    const id = generateRandomString();
    users[id] = { 
      'id': id,
      'email': email,
      'hashedPassword': hashedPassword 
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let userId = findUserByEmail(req.body.email);
  console.log(users);
  if (!userId){
    res.status(403).send("Email not found!");
  } else if (!bcrypt.compareSync(req.body.password, users[userId].hashedPassword)){
    res.status(403).send("Wrong password!");
  } else {
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
    return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function findUserByEmail(email){
  for (var user in users){
    if (users[user].email === email){
      return user;
    }
  }
}

function isRegistered(userID, res){
  for (var userID in users){
    if (userID){
      return true;
    } else {
      res.redirect("/register");
    }
  }
}

function isLoggedIn (cookie){
    if (cookie){
      return true;
    }
  }

function checkUrlOwnership(userId){
  for (var url in urlDatabase){
    if (userId === urlDatabase[url].userID){
      return true;
    } 
  }
}