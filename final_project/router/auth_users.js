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
  try{
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
      return res.status(404).json({message: "Error logging in!"});
    }
  
    if(!authenticatedUser(username, password)){
      return res.status(401).json({message: "Invalid Login data, check username and password!"});
    }
    const accessToken = jwt.sign({data: username}, "access", {expiresIn: 60*60});
    if(req.session){
      req.session.authorization = {
        accessToken, username
      };
      return res.status(200).json({message: "User successfully logged in!", token: accessToken});
    }
  }catch(err){
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try{
    const isbn = req.params.isbn;
    if(!isbn){
      return res.status(400).json({message: "ISBN not found!"});
    }
  
    const bookFound = books[isbn];
    if(!bookFound){
      return res.status(404).json({message: "No such book having this ISBN found!"});
    }
  
    const loggedInUser = req.session?.authorization?.username;
    if(!loggedInUser){
      return res.status(401).json({message: "User not authenticated!"});
    }
  
    const {review} = req.body;
    if(!review){
      return res.status(400).json({message: "Review text is required!"});
    }
    
    bookFound.reviews = bookFound.reviews || {};
    bookFound.reviews[loggedInUser] = review;
    books[isbn].reviews = bookFound.reviews;
    return res.status(200).json({ message: "Review added/updated.", review: bookFound.reviews[loggedInUser] })
  }catch(err){
    return res.status(500).json({message: "Internal server error!"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try{
    const isbn = req.params.isbn;
    if(!isbn){
      return res.status(400).json({message: "ISBN not found!"});
    }
  
    const bookFound = books[isbn];
    if(!bookFound){
      return res.status(404).json({message: "No such book having this ISBN found!"});
    }
  
    const loggedInUser = req.session?.authorization?.username;
    if(!loggedInUser){
      return res.status(401).json({message: "User not authenticated!"});
    }

    if(!Object.keys(bookFound.reviews).includes(loggedInUser)){
      return res.status(400).json({message: "No review for this user is found, please add a review!"});
    }

    delete bookFound.reviews[loggedInUser];
    books[isbn].reviews = bookFound.reviews;
    return res.status(200).json({message: "Review successfully deleted!"});
  }catch(err){
      return res.status(500).json({message: "Internal server error!"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
