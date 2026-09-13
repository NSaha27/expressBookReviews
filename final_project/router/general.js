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
public_users.get('/',async function (req, res) {
  try{
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if(books && Object.keys(books).length > 0){
          resolve(books);
        }else{
          reject(new Error("No book is available in the shop!"))
        }
      })
    }

    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  }catch(err){
    return res.status(404).json({message: err.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  try{
    const isbn = req.params.isbn;
    if(!isbn){
      throw new Error("ISBN not found!");
    }
    
    const getBook = (isbn) => {
      return new Promise((resolve, reject) => {
        const isBookFound = books[isbn];
        if(isBookFound){
          resolve(books[isbn]);
        }else{
          reject(new Error("No such book with this ISBN is found!"));
        }
      })
    }
    
    const book = await getBook(isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  }catch(err){
    return res.status(404).json({message: err.message});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    try{
      const author = req.params.author;
      if(!author){
        throw new Error("Author not found!");
      }

      const getBooks = (author) => {
        return new Promise((resolve, reject) => {
          const booksFound = Object.values(books).filter(book => book["author"] === author);
          if(booksFound.length > 0){
            resolve(booksFound);
          }else{
            reject(new Error(`No such book written by the author "${author}" is found!`))
          }
        })
      }
      
      const booksByAuthor = await getBooks(author);
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    }catch(err){
      return res.status(404).json({message: err.message});
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try{
      const title = req.params.title;
      if(!title){
        throw new Error("Title not found!");
      }

      const getBook = (title) => {
        return new Promise((resolve, reject) => {
          const bookFound = Object.values(books).find(book => book["title"] === title);
          if(bookFound){
            resolve(bookFound);
          }else{
            reject(new Error(`No such book with the title "${title}" is found!`));
          }
        })
      }
      
      const bookByTitle = await getBook(title);
      return res.status(200).send(JSON.stringify(bookByTitle, null, 4));
    }catch(err){
      return res.status(404).json({message: err.message});
    }
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    try{
      const isbn = req.params.isbn;
      if(!isbn){
        throw new Error("ISBN not found!");
      }

      const getReviews = (isbn) => {
        return new Promise((resolve, reject) => {
          const reviewsFound = books[isbn]["reviews"];
          if(reviewsFound){
            resolve(reviewsFound);
          }else{
            reject(new Error(`No review found for the book having the ISBN "${isbn}"!`))
          }
        })
      }
      
      const reviewsByBookISBN = await getReviews(isbn);
      return res.status(200).send(JSON.stringify(reviewsByBookISBN, null, 4));
    }catch(err){
      return res.status(404).json({message: err.message});
    }
});

module.exports.general = public_users;
