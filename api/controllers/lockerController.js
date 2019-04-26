'use strict';


var mongoose = require('mongoose'),
  Lockers = mongoose.model('Lockers');
  var boxes = require('../controllers/boxController');

exports.list_all_lockers = function(req, res) {
  Lockers.find({}, function(err, ) {
    if (err)
      res.send(err);
    res.json(lockers);
  });
};


exports.create_a_lockers = function(req, res) {
  var new_lockers = new Lockers(req.body);
  new_lockers.save(function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers);
  });
};


exports.read_a_lockers = function(req, res) {
  Lockers.findById(req.body.lockersId, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers);
  });
};


exports.update_a_lockers = function(req, res) {
  Lockers.findOneAndUpdate({_id: req.body.lockersId}, req.body, {new: true}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers);
  });
};


exports.delete_a_lockers = function(req, res) {
  Lockers.remove({_id: req.body.lockersId}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json({ message: 'Lockers successfully deleted' });
  });
};

exports.find_locker_by_ID = function(req, res) {
  Lockers.find({_id: req.body.lockersId}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers );
  });
};

exports.find_by_pointID = function(req, res) {
  Lockers.find({_id: req.body.pointId}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers );
  });
};

exports.find_by_status = function(req, res) {
  Lockers.find({status: req.body.status}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers );
  });
};

exports.book_a_locker = function(req, res) {
  Lockers.findOneAndUpdate({_id: req.body.id}, {lockerStatus: req.body.lockerStatus,
    lockerCode:req.body.lockerCode,lockerCode2:req.body.lockerCode2,orderID:req.body.orderID,type:req.body.type}, {new: false}, function(err, lockers) {
    if (err)
    {
      res.send(err);
    }
    if (req.body.type == 'pickup' || req.body.type == 'delivery')
    {
      if(req.body.machine == "1" || req.body.machine == "2")
      {
        req.body.machine = "100"+req.body.machine;
        boxes.boxAnnounce(req.body.type,req.body.vasteOrder,req.body.machine,req.body.size,req.body.valid ,function(vast){
          //boxes.boxUpdate(req.body.vasteOrder,req.body.type,req.body.machine,req.body.lockerCode2,req.body.valid,function(rt)
          //{
            res.json(lockers);
          //});

        });
      }
      else {
        res.json(lockers);
      }
    }
    else {
      res.json(lockers);
    }


  });
};

exports.get_locker_pin = function(req, res) {
  Lockers.findOne({orderID: req.body.orderID, type:req.body.type}, function(err, lockers) {
    if (err)
      res.send(err);
    res.json(lockers);
  });
};
