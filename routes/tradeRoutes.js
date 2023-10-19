const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const {authenticated, isAuthor, isOfferedBy, isSavedBy,} = require('../middlewares/auth');
const {validateId, validateitem, validationresult, saveitem} = require('../middlewares/validator'); 

router.get('/', controller.index);

router.get('/new', authenticated, controller.new);

router.post('/', authenticated, validateitem, validationresult, controller.create);

router.get('/:id',validateId, controller.show);

router.get('/:id/edit',validateId, authenticated, isAuthor, controller.edit);

router.put('/:id',validateId, authenticated, isAuthor, controller.update);

router.delete('/:id',validateId, authenticated, isAuthor, controller.delete);

router.post('/:id/save',validateId,authenticated,saveitem,validationresult,controller.save);

router.get('/:id/Trade', validateId, authenticated, controller.Trade);

router.get('/:id/tradeitem', authenticated, controller.tradeitem);

router.get('/:id/manage', validateId, authenticated, controller.manage);

router.get('/:id/accept', validateId, authenticated, controller.accept);

router.get('/:id/reject', validateId, authenticated, controller.reject);

////delete /items/id/save deletes items from the wishlist
router.delete('/:id/savedelete', validateId, authenticated, isSavedBy, controller.savedelete);
  
router.delete('/:id/offerdelete', validateId, authenticated, isOfferedBy, controller.offerdelete);
  
router.delete('/:id/manageofferdelete', validateId, controller.manageofferdelete);

module.exports=router;  