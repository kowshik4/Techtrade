const model = require('../models/trade');
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");
//const trade = require('../models/trade');

exports.index = (req, res, next) => {
    model.find()
    .then(trades=>res.render('./trade/index',{trades}))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./trade/new');
};

exports.create = (req, res, next) => {
    let trade = new model(req.body);
    trade.author = req.session.user;
    trade.Status = "Available";
    trade.offerName = "";
    trade.Saved = false;
    trade.Offered = false;
    trade.save()
    .then(trade=> res.redirect('/trades'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            err.status= 400;
        }
        next(err);
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('author', 'firstName lastName')
    .then(trade=>{
        if(trade) {
            console.log("trade is:" + trade); 
            res.render('./trade/show', {trade});
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
    
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(trade=>{
        if(trade) {
            return res.render('./trade/edit', {trade});
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
    
};

exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;

    model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
    .then(trade=>{
        if(trade) {
            res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError')
            err.status = 400;
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    model
      .findById(id)
      .then((trade) => {
        let name = trade.offerName;
        Promise.all([
          offer_model.findOneAndDelete(
            { Name: name },
            { useFindAndModify: false }
          ),
          model.findByIdAndDelete(id, { useFindAndModify: false }),
          model.findOneAndUpdate({title:name},{Status:"Available", Offered:false})
        ])
          .then((results) => {
            const [offer, trade, trade2] = results;
          })
          .catch((err) => {
            next(err);
          });
        req.flash("success", "Succesfully deleted an Item");
        res.redirect("/trades");
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.save = (req, res, next) => {
    console.log("in save");
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { Saved: true },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        let name = trade.title;
        let newSaveItem = new save_model({
          Name: trade.title,
          Category: trade.Category,
          Status: trade.Status,
        });
        newSaveItem.SavedBy = req.session.user;
        save_model
          .findOne({ Name: name })
          .then((trade) => {
            if (!trade) {
              newSaveItem
                .save()
                .then((newSaveItem) => {
                  req.flash("success", "Item Added to Wishlist");
                  res.redirect("/users/profile");
                })
                .catch((err) => {
                  if (err.name === "ValidationError") {
                    err.status = 400;
                  }
                  next(err);
                });
            } else {
              req.flash("error", "item already saved");
              res.redirect("/users/profile");
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

exports.Trade = (req, res, next) => {
    console.log("in trade");
    let user = req.session.user;
    iD = req.params.id;
    model
      .findByIdAndUpdate(
        iD,
        { Status: "Offer Pending", Offered: true },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        let newOffertrade = new offer_model({
          Name: trade.title,
          Status: "Offer Pending",
          Category: trade.Category,
          OfferedBy: user,
        });
        newOffertrade.save().then((offer) => {
          model
            .find({ author: user })
            .then((trades) => {
              res.render("./trade/itemtrade", { trades });
            })
            .catch((err) => {
              next(err);
            });
        });
      })
      .catch((err) => {
        next(err);
      })
  
      .catch((err) => {
        next(err);
      });
  };

  exports.tradeitem = (req, res, next) => {
    console.log("in trade item");
    let id = req.params.id;
    let user = req.session.user;
    Promise.all([
      model.findByIdAndUpdate(
        id,
        { Status: "Offer Pending" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      ),
      offer_model.findOne({ OfferedBy: user }).sort({ _id: -1 }),
    ])
      .then((results) => {
        const [trade, Offered] = results;
        let name = Offered.Name;
        model
          .findByIdAndUpdate(
            id,
            { offerName: name },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          )
          .then((trade) => {
            req.flash("success", "Offer Created");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.manage = (req, res, next) => {
    console.log("in manage offer function");
    let id = req.params.id;
    let user = req.session.user;
    model
      .findById(id)
      .then((trade) => {
        if (trade.offerName === "") {
          let name = trade.title;
          model
            .findOne({ offerName: name })
            .then((trade) => {
              res.render("./trade/manage", { trade });
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let name = trade.offerName;
          offer_model
            .findOne({ Name: name })
            .then((offer) => {
              res.render("./trade/manageoffer", { trade, offer });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.accept = (req, res, next) => {
    console.log("in accept");
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { Status: "Traded" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        let name = trade.offerName;
  
        Promise.all([
          model.findOneAndUpdate(
            { title: name },
            { Status: "Traded" },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          ),
          offer_model.findOneAndDelete(
            { Name: name },
            { useFindAndModify: false }
          ),
        ])
          .then((results) => {
            const [trade, offer] = results;
            req.flash("success", "Offer has been accepted by You!!");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.reject = (req, res, next) => {
    console.log("in reject");
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { Status: "Available", offerName: "" },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        let name = trade.offerName;
        Promise.all([
          model.findOneAndUpdate(
            { title: name },
            { Status: "Available", Offered:false },
            {
              useFindAndModify: false,
              runValidators: true,
            }
          ),
          offer_model.findOneAndDelete({ Name: name }),
        ])
          .then((results) => {
            const [trade, offer] = results;
            let name = trade.title;
            let status = trade.Status;
            if (trade.Saved) {
              save_model
                .findOneAndUpdate(
                  { Name: name },
                  { Status: status },
                  {
                    useFindAndModify: false,
                    runValidators: true,
                  }
                )
                .then((save) => {})
                .catch((err) => {
                  next(err);
                });
            }
            req.flash("success", "Offer has been rejected by You!!");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.savedelete = (req, res, next) => {
    console.log("in save delete");
    let id = req.params.id;
    model
      .findByIdAndUpdate(id, { Saved: false })
      .then((trade) => {
        let name = trade.title;
  
        save_model
          .findOneAndDelete({ Name: name }, { useFindAndModify: false })
          .then((save) => {
            req.flash("success", "trade Unsaved");
            res.redirect("back");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.offerdelete = (req, res, next) => {
    console.log("in offer delete");
    let id = req.params.id;
    model
      .findByIdAndUpdate(
        id,
        { Status: "Available", Offered: false },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        let name = trade.title;
  
        Promise.all([
          model.findOneAndUpdate(
            { offerName: name },
            { Status: "Available", offerName: "" }
          ),
          offer_model.findOneAndDelete(
            { Name: name },
            { useFindAndModify: false }
          ),
        ])
          .then((results) => {
            const [trade, offer] = results;
            req.flash("success", "Offer has been cancelled by You!!");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };
  
  exports.manageofferdelete = (req, res, next) => {
    console.log("in manage-offer delete");
    let id = req.params.id;
    model
      .findByIdAndUpdate(id, { Status: "Available", offerName: "" })
      .then((trade) => {
        let name = trade.offerName;
        Promise.all([
          offer_model.findOneAndDelete({ Name: name }),
          model.findOneAndUpdate(
            { title: name },
            { Status: "Available", Offered: false }
          ),
        ])
          .then((results) => {
            const [offer, trade] = results;
            req.flash("success", "Offer cancelled by You!!");
            res.redirect("/users/profile");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  };