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

router.get('/', asyncHandler(async (req, res) => {
    const allBooks= await Book.findAll(); 
    res.render('index', {allBooks} );
  }));


  

  router.get('/new', asyncHandler(async(req,res)=>{
    res.render('new-book');
  }));

  router.post('/new', asyncHandler(async (req, res)=>{
    //form will pass data via req.body
    const book = await Book.create(req.body);
    res.send(book);
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
    //form will pass data via req.body
    const book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books/' + book.id);
    
  }));

  router.post('/:id/delete', asyncHandler(async (req,res)=>{
    const book = await Book.findByPk(req.params.id);
    await book.destroy();
    res.redirect('/books/');

  }));


module.exports = router;
