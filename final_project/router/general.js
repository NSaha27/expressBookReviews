const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
      if (isValid(username)) {
          users.push({ "username": username, "password": password });
          return res.status(200).json({ message: "User successfully registered. Now you can login" });
      } else {
          return res.status(404).json({ message: "User already exists!" });
      }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  if(Object.keys(books).length > 0){
    return res.status(200).send(JSON.stringify(books));
  }
  return res.status(404).json({message: "No book is available in the shop"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(!isbn){
    return res.status(404).json({message: "ISBN not found!"});
  }
  const isbnFound = Object.keys(books).includes(isbn);
  if(!isbnFound){
    return res.status(404).json({message: "No such book having this ISBN found!"});
  }
  return res.status(200).send(JSON.stringify(books[isbn]));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    if(!author){
      return res.status(404).json({message: "Author not found!"});
    }
    const booksFound = Object.values(books).filter(book => book["author"] === author);
    if(booksFound.length === 0){
      return res.status(404).json({message: `No such book written by the author "${author}" is found!`});
    }
    return res.status(200).send(JSON.stringify(booksFound));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    if(!title){
      return res.status(404).json({message: "Title not found!"});
    }
    const bookFound = Object.values(books).find(book => book["title"] === title);
    if(!bookFound){
      return res.status(404).json({message: `No such book with the title "${title}" is found!`});
    }
    return res.status(200).send(JSON.stringify(bookFound));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(!isbn){
      return res.status(404).json({message: "ISBN not found!"});
    }
    const isbnFound = Object.keys(books).includes(isbn);
    if(!isbnFound){
      return res.status(404).json({message: `No such book having the ISBN "${isbn}" found!`});
    }
    const reviewsFound = books[isbn]["reviews"];
    return res.status(200).send(JSON.stringify(reviewsFound));
});

module.exports.general = public_users;
