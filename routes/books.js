const express = require('express');
const router = express.Router();
const Book = require('../models').Book;


function asyncHandler(cb){
  return async(req, res,next ) =>{
    try{
      await cb(req, res, next);
    } catch(error){
      res.status(500).send(error);
    }
  }
}

function pagination(){
  //pass pagination in here so I can use it on multiple routes
}



router.get('/page/:num', asyncHandler(async(req,res) => {
  console.log(req.params.num);
}));



router.get('/', asyncHandler(async (req, res) => {


  

  //Books per page
  const perPage = 5;

  let currPage = 0;
  let offset =currPage*perPage;  //currpage;
  let limit =perPage;
  let totalBooks = await Book.findAndCountAll();
  let totalPages = Math.round(totalBooks.count/limit);
  //need to find how to pass this to UI

  // All book data, limited by offset
  const allBooks= await Book.findAll({offset, limit}); 
    
    // Total num of books
    //const totalBooks = allBooks.length;
    //generate page var dependent on num of returns
    //onclick, update perpage variable
    //on load, get first 5 pages ( query for first 5 returns)
    //on click of currPage, go to url /page/currPage
    //on click of currPage run new query to get item currPage*startNum - currPage*endNum //
    


    res.render('index', {allBooks, totalPages} );
  }));


  

  router.get('/new', asyncHandler(async(req,res)=>{
    res.render('new-book');
  }));

  router.post('/new', asyncHandler(async (req, res)=>{
    let book;
    try{
      book = await Book.create(req.body);
      res.redirect('/books/'+ book.id)
    }catch(error){
      if(error.name === 'SequelizeValidationError') {
        console.log('blong',error);
        book = await Book.build(req.body);
        res.render("new-book", { book, errors: error.errors, title: "New Book" });
      } else {
        console.log('else');
        throw error;
      }
    }
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book){
      res.render('book-details', {book} );
    } else {
      res.sendStatus(404);
    }
    
  }));

  router.post('/:id', asyncHandler(async (req, res)=>{
    let book;
    try{
      book = await Book.findByPk(req.params.id);
      if(book){
        await book.update(req.body);
        res.redirect('/books/' + book.id);
      }else{
        res.sendStatus(404);
      }
    }catch(error){
      console.log('error');
      if(error.name === "SequelizeValidationError"){
        console.log('if');
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render('book-details', {book, errors:error.errors, title: "Edit Book"});
      }else {
        throw error;
      }
    }
    
    
  }));

  router.post('/:id/delete', asyncHandler(async (req,res)=>{
    const book = await Book.findByPk(req.params.id);
    await book.destroy();
    res.redirect('/books/');

  }));


module.exports = router;
