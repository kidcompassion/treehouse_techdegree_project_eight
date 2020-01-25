const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Book = require('../models').Book;

/**
 * Async/Await Handler
 * @param {*} cb 
 * 
 */
function asyncHandler(cb){
  return async(req, res,next ) =>{
    try{
      await cb(req, res, next);
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/**
 * Paginate
 * Runs inside the find all query to retrieve results page by page. 
 * @param {page} INT
 * @param {pageSize} INT
 */
const paginate = ({ page, pageSize }) => {
  const offset = page * pageSize;
  const limit = pageSize;
  return {
    offset,
    limit,
  };
};

/**
 * Checks to see if selected route has page param
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkIfPageOne= (req, res, next) =>{
  // If the param of the current page is 0, just redirect to the root because having 0 in the url is weird
  if(req.params.num != '0'){
    next();
  }else {
    res.redirect('/');
  }  
}

/**
 * Get /books
 * First page of all returns, includes pagination 
 */

router.get('/', asyncHandler(async (req, res) => {

  // By default, set current page to 0
  let page = 0;
  //Set how many items perPage
  const pageSize = 5;
  //Get total number of items to calculate number of pages
  const totalBooks = await Book.findAndCountAll();
  //Calculate number of pages
  const totalPages = Math.ceil(totalBooks.count/pageSize);
  // All book data, limited by offset
  const allBooks= await Book.findAll(paginate({ page, pageSize }));
  res.render('index', {allBooks, totalPages} );
}));

/**
 * Get /books/page/:num
 * Handle pagination on secondary pages
 */

router.get('/page/:num', checkIfPageOne, asyncHandler(async(req,res) => {
  
  const page = req.params.num;
  const pageSize = 5;
  const totalBooks = await Book.findAndCountAll();
  const totalPages = Math.ceil(totalBooks.count/pageSize);
  const allBooks= await Book.findAll(paginate({ page, pageSize }));
  res.render('index', {allBooks, totalPages} );                                
 }));


/**
 * Get /new
 * Handles form for adding books
 */
router.get('/new', asyncHandler(async(req,res)=>{
  res.render('new-book');
}));

/**
 * Post /new
 * Submit contents of form, check form validation, return new Book obj
 */
router.post('/new', asyncHandler(async (req, res)=>{
  let book;
  try{
    // If the book is successfully created, redirect to its new URL
    book = await Book.create(req.body);
    res.redirect('/books/'+ book.id)
  }catch(error){
    //Otherwise, Build the error on the form page
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" });
    } else {
      throw error;
    }
  }
}));

/**
 * Get /books/:id
 * Queries for a specific title based on id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try{
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', {book} );
    console.log('try');
  } catch(error) {
    console.log('catch');
    //Otherwise, Build the error on the form page
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render("update-book", { book, errors: error.errors});
    } else {
      console.log('else');
      throw error;
    }
  }
  
}));

/**
 * Post /books/:id
 * Updates existing title
 */
router.post('/:id', asyncHandler(async (req, res)=>{
  let book;
  try{
    // If book id exists and is found, update it and then redirect
    book = await Book.findByPk(req.params.id);
    if(book){
      await book.update(req.body);
      res.redirect('/books/' + book.id);
    }else{
      res.sendStatus(404);
    }
  }catch(error){
    //Else, construct an error based on the error name
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', {book, errors:error.errors});
    }else {
      throw error;
    }
  }
}));

/**
 * Delete /books/:id/delete
 * Remove book from the DB
 */

 router.post('/:id/delete', asyncHandler(async (req,res)=>{
  //First query the book by id
  const book = await Book.findByPk(req.params.id);
  //then destroy it
  await book.destroy();
  //then redirect to index
  res.redirect('/books/');
}));


/**
 * Post Search Results
 * When user submits a search, pass the field contents into a route param 
 */

router.post('/search/results', asyncHandler(async (req,res)=>{
  // Pass queried term to URL and set it to be case insensitive so the address doesnt look weird
  res.redirect('/books/search/'+ req.body.search.toLowerCase());
}));


/**
 * Get /books/search/:term
 * Gets and paginates search returns 
 */

router.get('/search/:term', asyncHandler(async(req,res)=>{
  //Set the term to be lowercase so it's case insentivie
  const term = req.params.term.toLowerCase();

  // Use operator to get like terms from search
  const searchResults = await Book.findAll({
    where: {
        [Op.or]:[
          {title: {[Op.like]:'%'+term+'%'}},
          {author: {[Op.like]:'%'+term+'%'}},
          {genre: {[Op.like]:'%'+term+'%'}},
          {year: {[Op.like]:'%'+term+'%'}},
        ],
    },
  });

  res.render('search', {searchResults, term});
}));



module.exports = router;
