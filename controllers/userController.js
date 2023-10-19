const model = require('../models/user');
const Trade = require('../models/trade');
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");
const user = require('../models/user');

exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    user.save()//insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {

    res.render('./user/login');
}

exports.signup = (req, res) => {
    console.log("in signup function");
    res.render("./user/signup");
  };

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), 
        Trade.find({author: id}),
        Trade.find({ Saved: true }),
        save_model.find({ SavedBy: id }),
        Trade.find({ Offered: true }),
        offer_model.find({ OfferedBy: id }),
    ])
    .then(results=>{
        const [user, trades, saved, saves, offered, offers] = results;
        console.log("user is :" + user)
        console.log("trades are: "+ trades);
        res.render('./user/profile', {user, trades, saved, saves, offered, offers});
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

 exports.wishlist = (req, res, next) => {
    console.log("in wishlist");
    let id = req.session.user;
    Promise.all([user.findById(id), save_model.find({ SavedBy: id })])
      .then((results) => {
        const [user, trades] = results;
        res.render("save", { user, trades });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.managedelete = (req, res, next) => {
    res.send("in manage cancel");
  };

