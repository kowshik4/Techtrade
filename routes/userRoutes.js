const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, authenticated, isAddedBy,
    isSavedBy,
    isOfferedBy,
} = require('../middlewares/auth.js');
const router = express.Router();
const { Limiter } = require("../middlewares/rateLimiters");
const { validateId,validateLogin,validateSignup,validationresult,} = require('../middlewares/validator');
//const { validationResult } = require('express-validator');

//GET /users/new: send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/',Limiter, isGuest, validateSignup, validationresult, controller.create);

//GET /users/login: send html for logging in
router.get('/login',isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login', Limiter, isGuest, validateLogin, validationresult, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', authenticated, controller.profile);

//POST /users/logout: logout a user
router.get('/logout', authenticated, controller.logout);

//get /users/save renders the wishlist page
//router.get("/save", controller.wishlist);

module.exports = router;