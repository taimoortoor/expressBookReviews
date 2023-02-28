const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }


public_users.post("/register", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) { 
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
          return res.status(404).json({message: "User already exists!"});
        }
      } 
      return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let ISBN = req.params.isbn;
  
    res.send(books[ISBN])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let ans = []
    for(const [key, values] of Object.entries(books)){
        const book = Object.entries(values);
        for(let i = 0; i < book.length ; i++){
            if(book[i][0] == 'author' && book[i][1] == req.params.author){
                ans.push(books[key]);
            }
        }
    }
    if(ans.length == 0){
        return res.status(300).json({message: "Author not found"});
    }
    res.send(ans);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let ans = []
    for(const [key, values] of Object.entries(books)){
        const book = Object.entries(values);
        for(let i = 0; i < book.length ; i++){
            if(book[i][0] == 'title' && book[i][1] == req.params.title){
                ans.push(books[key]);
            }
        }
    }
    if(ans.length == 0){
        return res.status(300).json({message: "Title not found"});
    }
    res.send(ans);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let ISBN = req.params.isbn;
    res.send(books[ISBN].reviews)
});

// Get the book list available in the shop (Async)

    async function getBookList() {
        return books;
      }
      public_users.get('/',function (req, res) {
        getBookList().then(
          (bk)=>res.send(JSON.stringify(bk, null, 4)),
          (error) => res.send("denied")
        );  
      });

      // Get book list by ISBN (Async)

      async function getFromISBN(isbn) {
        let book_ = books[isbn];
        if (book_) {
          return book_;
        } else {
          throw new Error("Unable to find book!");
        }
      }
    
      public_users.get('/isbn/:isbn', async function (req, res) {
        const isbn = req.params.isbn;
        try {
          const bk = await getFromISBN(isbn);
          res.send(JSON.stringify(bk, null, 4));
        } catch (error) {
          res.send(error);
        }
      });
    
        // Get book list by author (Async)
        async function getFromAuthor(author) {
            let output = [];
            for (var isbn in books) {
              let book_ = books[isbn];
              if (book_.author === author){
                output.push(book_);
              }
            }
            if (output.length > 0) {
              return output;
            } else {
              throw new Error("No books found for the author!");
            }
          }
          
          public_users.get('/author/:author',function (req, res) {
            const author = req.params.author;
            getFromAuthor(author)
            .then(
              result =>res.send(JSON.stringify(result, null, 4))
            );
          });

          // Get book list by title

          async function getFromTitle(title) {
            let output = [];
            for (var isbn in books) {
              let book_ = books[isbn];
              if (book_.title === title){
                output.push(book_);
              }
            }
            if (output.length > 0) {
              return output;
            } else {
              throw new Error("No books found with the given title!");
            }
          }

          public_users.get('/title/:title', async function (req, res) {
            const title = req.params.title;
            try {
              const result = await getFromTitle(title);
              res.send(JSON.stringify(result, null, 4));
            } catch (error) {
              res.send(error);
            }
          });
          
          

module.exports.general = public_users;
