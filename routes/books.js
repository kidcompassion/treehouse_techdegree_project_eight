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
    res.render('new-book', {title: 'my form'});
  }));

  router.post('/new', asyncHandler(async (req, res)=>{
    //form will pass data via req.body
    const book = await Book.create(req.body);
    res.redirect(book.id);
    
    
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    res.render('book-details', {book} );
  }));



module.exports = router;
