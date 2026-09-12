const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const userWithSameName = users.filter(user => user.username === username);
    if(userWithSameName.length > 0){
        return false;
    }else{
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const validUsers = users.filter(user => user.username === username && user.password === password);
  if(validUsers.length > 0){
    return true;
  }else{
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(404).json({message: "Error logging in!"});
  }

  if(!authenticatedUser(username, password)){
    return res.status(208).json({message: "Invalid Login data, check username and password!"});
  }
  const accessToken = jwt.sign({data: password}, "access", {expiresIn: 60 * 60});
  req.session.authorization = {
    accessToken, username
  };
  return res.status(200).json({message: "User successfully logged in!"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
