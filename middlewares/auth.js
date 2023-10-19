const trade = require('../models/trade');
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");

//To check if user is guest
exports.isGuest = (req,res,next)=>{
    if(!req.session.user){
         return next();
         }else{
             req.flash('error', 'You are logged in already');
             return res.redirect('/users/profile');
         }
}

//To check if user is authenticated
exports.authenticated = (req,res,next)=>{
    if(req.session.user){
        return next();
    }else{
        req.flash('error', 'You need to login first!');
        res.redirect('/users/login');
    }
};

//To check if user is author of the trade
exports.isAuthor = (req,res,next)=>{
    id = req.params.id;
    trade.findById(id)
    .then((trade)=>{
        if(trade){
            if(trade.author==req.session.user){
                console.log("author is same as user");
                return next();
            }else{
                let err= new Error ("you are not authorised to perform action");
                err.status =401;
                next(err);
            }
        }
    })
    .catch(err=>{
        next(err);
    })
};
  
exports.isSavedBy = (req, res, next) => {
    id = req.params.id;
    trade
      .findById(id)
      .then((trade) => {
        let name = trade.title;
        save_model
          .findOne({ Name: name })
          .then((trade) => {
            if (trade) {
              if (trade.SavedBy == req.session.user) {
                console.log("Owner is same as user");
                return next();
              } else {
                let err = new Error("you are not authorised to perform action");
                err.status = 401;
                next(err);
              }
            } else {
              let error = new Error("No trade found with id  " + id);
              error.status = 404;
              next(error);
            }
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
exports.isOfferedBy = (req, res, next) => {
    id = req.params.id;
    trade
      .findById(id)
      .then((trade) => {
        let name = trade.title;
        offer_model
          .findOne({ Name: name })
          .then((trade) => {
            if (trade) {
              if (trade.OfferedBy == req.session.user) {
                console.log("Owner is same as user");
                return next();
              } else {
                let err = new Error("you are not authorised to perform action");
                err.status = 401;
                next(err);
              }
            } else {
              let error = new Error("No trade found with id  " + id);
              error.status = 404;
              next(error);
            }
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };