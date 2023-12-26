const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} Registered Successfully`});
        }
        else {
            return res.status(400).json({message:`User ${username} Already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const bks = await getBooks();
      res.send(JSON.stringify(bks));
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getByISBN(req.params.isbn)
  .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({message: error.message})
  );
});


// Task 11
// Get book details based on ISBN using promises
public_users.get('/isbn-promise/:isbn', function (req, res) {
    getByISBNPromise(req.params.isbn)
        .then((result) => res.send(result))
        .catch((error) => res.status(error.status).json({ message: error.message }));
});

// Function to get book details based on ISBN using promises
function getByISBNPromise(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({ status: 404, message: `ISBN ${isbn} not found` });
        }
    });
}
// Task 12
// Get all books based on author using async/await
public_users.get('/author-async/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const filteredBooks = await getBooksByAuthorAsync(author);
        res.send(filteredBooks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Async function to get all books based on author
async function getBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        getBooks().then((bookEntries) => Object.values(bookEntries))
            .then((books) => books.filter((book) => book.author === author))
            .then((filteredBooks) => resolve(filteredBooks))
            .catch((error) => reject(error));
    });
}
// Task 13
// Get all books based on title using async/await
public_users.get('/title-async/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const filteredBooks = await getBooksByTitleAsync(title);
        res.send(filteredBooks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Async function to get all books based on title
async function getBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        getBooks().then((bookEntries) => Object.values(bookEntries))
            .then((books) => books.filter((book) => book.title === title))
            .then((filteredBooks) => resolve(filteredBooks))
            .catch((error) => reject(error));
    });
}

module.exports.general = public_users;