'use strict';


var mongoose = require('mongoose'),
  Deliverys = mongoose.model('Deliverys');
var Orders = mongoose.model('Orders');
var fs = require('fs');
var environmentJson = fs.readFileSync("./environment.json");
var environment = JSON.parse(environmentJson);
var Lockers = mongoose.model('Lockers');
var dc = mongoose.model('DeliveryConfirmation');

exports.list_all_deliverys = function(req, res) {
  Deliverys.find({}, function(err, deliverys) {
    if (err)
      res.send(err);
    res.json(deliverys);
  });
};
exports.list_by_company = function(req, res) {
  Deliverys.find({companyID:req.body.companyID}, function(err, deliverys) {
    if (err)
      res.send(err);
    res.json(deliverys);
  });
};

exports.list_by_vehicle = function(req,res){
	Deliverys.find({vehicleID:req.body.vehicleID}, function(err, deliverys){
		if(err)
			res.send(err);
		res.json(deliverys);
	});
}

exports.find_by_status = function(req, res) {	//statuksen mukaan
  Deliverys.find({status:req.params.status}, function(err, deliverys) {
    if (err)
      res.send(err);
    res.json(deliverys);
  });
};


exports.create_a_deliverys = function(req, res) {
  var new_deliverys = new Deliverys(req.body);
  new_deliverys.save(function(err, deliverys) {
    if (err)
    {
      res.send(err);
    }
    var log = require('../controllers/orderLogController');
    var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var jso = {
      user:"api",
      ip: ipa,
      timestamp: Math.floor(new Date() / 1000),
      code: "operator_delivery",
      orderID:deliverys.orderID,
      deliveryID: deliverys._id,
      companyID: req.body.companyID,
      vehicleID:req.body.vehicleID
    };
    log.logThis(jso);
    sendStatusChange(deliverys.orderID,"operator_delivery",req.body.companyID);

    res.json(deliverys);
  });
};


exports.read_a_deliverys = function(req, res) {
  Deliverys.findById(req.params.deliverysId, function(err, deliverys) {
    if (err)
      res.send(err);
    res.json(deliverys);
  });
};


exports.update_a_deliverys = function(req, res) {
  Deliverys.findOneAndUpdate({_id: req.params.deliverysId}, req.body, {new: true}, function(err, deliverys) {
    if (err)
      res.send(err);
    res.json(deliverys);
  });
};


exports.delete_a_deliverys = function(req, res) {
  Deliverys.findOneAndUpdate({_id: req.body.deliveryID, companyID: req.body.companyID},{status:"cancelled"} ,{new: true},function(err, deliverys) {
		if (err)
    {
      res.send(err);
    }
		var log = require('../controllers/orderLogController');
    var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var jso = {
      user:"api",
      ip: ipa,
      timestamp: Math.floor(new Date() / 1000),
      code: "operator_cancel",
      orderID:req.body.orderID,
      deliveryID: req.body.deliverysId,
      companyID: req.body.companyID
    };
    log.logThis(jso);
    sendStatusChange(req.body.orderID, "operator_cancel");

    res.json(deliverys);
  });
};
exports.delete_a_boxdeliverys = function(req, res) {
  Deliverys.findOneAndUpdate({_id: req.body.deliveryID, companyID: req.body.companyID},{status:"box_cancelled"} ,{new: true},function(err, deliverys) {
		if (err)
    {
      res.send(err);
    }
		var log = require('../controllers/orderLogController');
    var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var jso = {
      user:"api",
      ip: ipa,
      timestamp: Math.floor(new Date() / 1000),
      code: "operator_cancel",
      orderID:req.body.orderID,
      deliveryID: req.body.deliverysId,
      companyID: req.body.companyID
    };
    log.logThis(jso);
    sendStatusChange(req.body.orderID, "operator_cancel");

    res.json(deliverys);
  });
};

exports.delete_a_addressdeliverys = function(req, res) {
  Deliverys.findOneAndUpdate({_id: req.body.deliveryID, companyID: req.body.companyID},{status:"cancelled"} ,{new: true},function(err, deliverys) {
		if (err)
    {
      res.send(err);
    }
		var log = require('../controllers/orderLogController');
    var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var jso = {
      user:"api",
      ip: ipa,
      timestamp: Math.floor(new Date() / 1000),
      code: "operator_cancel",
      orderID:req.body.orderID,
      deliveryID: req.body.deliverysId,
      companyID: req.body.companyID
    };
    log.logThis(jso);
    sendStatusChange(req.body.orderID, "operator_cancel");

    res.json(deliverys);
  });
};


exports.find_delivery_by_ID = function(req, res){
	Deliverys.find({vehicleID:req.params.vehiclesId, orderID:req.params.ordersId}, function(err, deliverys){
	if (err)
      res.send(err);
    res.json(deliverys);
  });
};

exports.find_delivery_by_vehicle = function(req, res){
	Deliverys.find({vehicleID:req.params.vehiclesId}, function(err, deliverys){
	if (err)
      res.send(err);
    res.json(deliverys);
  });
};

exports.find_delivery_by_order = function(req, res){
	Deliverys.find({orderID:req.body.orderID}, function(err, deliverys){
	if (err)
      res.send(err);
    res.json(deliverys);
  });
};

exports.changeDeliveryStatus = function(req,res)
{
  console.log("req.body:"+req.body.pincode);
  if (req.body.status == 'group_accepted')
  {
    var new_deliverys = new Deliverys({
      "vehicleID": req.body.vehicleID,
    	"orderID": req.body.orderID,
      "companyID":req.body.companyID,
      "status":"accepted",
      "start":"address"
    });
    Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli == undefined || deli == null || deli.length < 1)
      {
        new_deliverys.save(function(err, deliverys22) {

          var update = { vehicleID:req.body.vehicleID,status: "accepted", time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
          Deliverys.find({orderID:req.body.orderID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
            if (deli.length > 0)
            {
              var query = { _id: deli[0]._id };
              Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                if(err)
                {
                  res.send(err);
                }
                var oQuery = { _id: req.body.orderID };
                var oUpdate = { status: "accepted" };
                Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                {
                  if (err2)
                  {
                    res.send(err2);
                  }
                  var log = require('../controllers/orderLogController');
                  var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                  var c = "";

                  c = "group_address_pickup_accepted";
                  var jso = {
                    user:"api",
                    ip: ipa,
                    timestamp: Math.floor(new Date() / 1000),
                    code: c,
                    orderID:req.body.orderID,
                    deliveryID: deliverys._id,
                    companyID: ord.companyID,
                    vehicleID:req.body.vehicleID
                  };
                  log.logThis(jso);
                  sendStatusChange(req.body.orderID,c,ord.companyID);
                  sendStatusChange2(req.body.orderID,c);
                  res.json(deliverys);

                 });

            });
            }
            else {
              res.json({'error':'Delivery not found'});
            }
          });
        });
      }
      else {
        res.json({'error':'Delivery not found'});
      }
    });
  }
  else if (req.body.status == 'box_auto')
  {
    var new_deliverys = new Deliverys({
      "vehicleID": req.body.vehicleID,
    	"orderID": req.body.orderID,
      "companyID":req.body.companyID,
      "status":"box_accepted"
    });
    Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli == undefined || deli == null || deli.length < 1)
      {
        new_deliverys.save(function(err, deliverys22) {

          var update = { vehicleID:req.body.vehicleID,status: "box_accepted", time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
          Deliverys.find({orderID:req.body.orderID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
            if (deli.length > 0)
            {
              var query = { _id: deli[0]._id };
              Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                if(err)
                {
                  res.send(err);
                }
                var oQuery = { _id: req.body.orderID };
                var oUpdate = { status: req.body.orderStatus };
                Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                {
                  if (err2)
                  {
                    res.send(err2);
                  }
                  var log = require('../controllers/orderLogController');
                  var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                  var c = "";

                  c = "box_auto";

                  var jso = {
                    user:"api",
                    ip: ipa,
                    timestamp: Math.floor(new Date() / 1000),
                    code: c,
                    orderID:req.body.orderID,
                    deliveryID: deliverys._id,
                    companyID: ord.companyID,
                    vehicleID:req.body.vehicleID
                  };
                  log.logThis(jso);
                  sendStatusChange(req.body.orderID,c,ord.companyID);
                  sendStatusChange2(req.body.orderID,c);
                  res.json(deliverys);

                 });

            });
            }
            else {
              res.json({'error':'Delivery not found'});
            }
          });
        });
      }
      else {
        res.json({'error':'Delivery not found'});
      }
    });
  }
  else if (req.body.status == 'box_address_auto')
  {
    console.log(req.body);
    var new_deliverys = new Deliverys({
      "vehicleID": req.body.vehicleID,
    	"orderID": req.body.orderID,
      "companyID":req.body.companyID,
      "status":"accepted"
    });
    Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli == undefined || deli == null || deli.length < 1)
      {
        new_deliverys.save(function(err, deliverys22) {

          var update = { vehicleID:req.body.vehicleID,status: "accepted", time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
          Deliverys.find({orderID:req.body.orderID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
            if (deli.length > 0)
            {
              var query = { _id: deli[0]._id };
              Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                if(err)
                {
                  res.send(err);
                }
                var oQuery = { _id: req.body.orderID };
                var oUpdate = { status: "accepted" };
                Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                {
                  if (err2)
                  {
                    res.send(err2);
                  }
                  var log = require('../controllers/orderLogController');
                  var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                  var c = "";

                  c = "accepted";
                  var jso = {
                    user:"api",
                    ip: ipa,
                    timestamp: Math.floor(new Date() / 1000),
                    code: c,
                    orderID:req.body.orderID,
                    deliveryID: deliverys._id,
                    companyID: ord.companyID,
                    vehicleID:req.body.vehicleID
                  };
                  log.logThis(jso);
                  sendStatusChange(req.body.orderID,c,ord.companyID);
                  sendStatusChange2(req.body.orderID,c);
                  res.json(deliverys);

                 });

            });
            }
            else {
              res.json({'error':'Delivery not found'});
            }
          });
        });
      }
      else {
        res.json({'error':'Delivery not found'});
      }
    });



  }
  else if (req.body.status == 'address_auto')
  {
    var new_deliverys = new Deliverys({
      "vehicleID": req.body.vehicleID,
    	"orderID": req.body.orderID,
      "companyID":req.body.companyID,
      "status":"address_pickup_accepted"
    });
    Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli == undefined || deli == null || deli.length < 1)
      {
        new_deliverys.save(function(err, deliverys22) {

          var update = { vehicleID:req.body.vehicleID,status: "address_pickup_accepted", time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
          Deliverys.find({orderID:req.body.orderID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
            if (deli.length > 0)
            {
              var query = { _id: deli[0]._id };
              Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                if(err)
                {
                  res.send(err);
                }
                var oQuery = { _id: req.body.orderID };
                var oUpdate = { status: req.body.orderStatus };
                Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                {
                  if (err2)
                  {
                    res.send(err2);
                  }
                  var log = require('../controllers/orderLogController');
                  var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                  var c = "";

                  c = "address_pickup_accepted";
                  var jso = {
                    user:"api",
                    ip: ipa,
                    timestamp: Math.floor(new Date() / 1000),
                    code: c,
                    orderID:req.body.orderID,
                    deliveryID: deliverys._id,
                    companyID: ord.companyID,
                    vehicleID:req.body.vehicleID
                  };

									//console.log(jso);
                  log.logThis(jso);
                  sendStatusChange(req.body.orderID,c,ord.companyID);
                  sendStatusChange2(req.body.orderID,c);
                  res.json(deliverys);

                 });

            });
            }
            else {
              res.json({'error':'Delivery not found'});
            }
          });
        });
      }
      else {
        res.json({'error':'Delivery not found'});
      }
    });
  }
  else if (req.body.status == 'terminal_stop')
  {
    var query = { _id: req.body.deliveryID };
    var update = { vehicleID:req.body.vehicleID,status: req.body.status, time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
    Deliverys.find({_id:req.body.deliveryID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli != undefined && deli.length > 0)
      {
        Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
          if(err)
          {
            res.send(err);
          }
            var oQuery = { _id: req.body.orderID };

            var oUpdate = { status: "terminal_start" };
            Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
            {
              if (err2)
              {
                console.log(err2);
              }
              var log = require('../controllers/orderLogController');
              var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
              var c = "terminal_stop";

              var jso = {
                user:"api",
                ip: ipa,
                timestamp: Math.floor(new Date() / 1000),
                code: c,
                orderID:req.body.orderID,
                deliveryID: req.body.deliveryID,
                companyID: req.body.companyID,
                vehicleID:req.body.vehicleID
              };

							//console.log(jso);
              log.logThis(jso);
              res.json(deliverys);
              sendStatusChange2(req.body.orderID,c);
            });



        });
      }
      else {
        res.json({'error':'Delivery not found'});
      }
    });
  }
  else if (req.body.status == 'terminal_start')
  {
    var query = { _id: req.body.deliveryID };
    var update = { vehicleID:req.body.vehicleID,status: req.body.status};
    var new_deliverys = new Deliverys({
      "vehicleID": req.body.vehicleID,
    	"orderID": req.body.orderID,
      "companyID":req.body.companyID,
      "status":"delivery_not_ready",
      "start":"terminal"
    });
    Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
      if (deli == undefined || deli == null || deli.length < 1)
      {
        new_deliverys.save(function(err, deliverys22) {
          if(err)
          {
            res.send(err);
          }
            var oQuery = { _id: req.body.orderID };

            var oUpdate = { status: "delivery_not_ready" };
            Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
            {
              var log = require('../controllers/orderLogController');
              var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
              var c = "terminal_start";

              var jso = {
                user:"api",
                ip: ipa,
                timestamp: Math.floor(new Date() / 1000),
                code: c,
                orderID:req.body.orderID,
                deliveryID: req.body.deliveryID,
                companyID: req.body.companyID,
                vehicleID:req.body.vehicleID
              };
							//console.log(jso);
              log.logThis(jso);
              res.json(deliverys22);
              sendStatusChange2(req.body.orderID,c);
            });



        });
      }
      else {
        res.json({'error':'Delivery already found'});
      }
    });
  }
  else
  {
    if (req.body.status == "done" && req.body.pincode != null && req.body.pincode.length > 4)
    {
      dc.findOne({orderID:req.body.orderID,type:"delivery"}, function(err, d) {
        if (err)
        {
          res.json({'error':'Delivery not found'});
        }
        if (d != undefined && d != null && req.body.pincode == d.pin)
        {
          dc.findOneAndUpdate({orderID:req.body.orderID,type:"delivery"},{status:"verified"},{new: true}, function(err2, da) {
            if (err2)
            {
              res.json({'error':'Delivery not found'});
            }
            else
            {
              var query = { _id: req.body.deliveryID };
            	var update = { vehicleID:req.body.vehicleID,status: req.body.status, time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
              Deliverys.find({_id:req.body.deliveryID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
                if (deli != undefined && deli.length > 0)
                {
                  Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                    if(err)
                    {
                      res.send(err);
                    }
                    var oQuery = { _id: req.body.orderID };
                    var oUpdate = { status: req.body.orderStatus };
                    Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                    {
                      if (err2)
                      {
                        res.send(err2);
                      }
                      var log = require('../controllers/orderLogController');
                      var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                      var c = "";
                      if (req.body.status == "accepted" || req.body.status == 'box_accepted')
                      {
                        c = "driver_accept";
                      }
                      else if (req.body.status == "inProgress")
                      {
                        c = "driver_pickup";
                      }
                      else if (req.body.status == "cancelled" || req.body.status == 'box_cancelled')
                      {
                        c = "driver_cancel";
                      }
                      else if (req.body.status == "done")
                      {
                        c = "driver_delivery";
                      }
                      else if (req.body.status == "delivery_ready")
                      {
                        c = "delivery_ready";
                      }
                      else if (req.body.status == "delivery_not_ready")
                      {
                        c = "delivery_not_ready";
                      }
                      else if (req.body.status == "address_pickup_accepted")
                      {
                        c = "address_pickup_accepted";
                      }
                      else if (req.body.status == "address_pickup")
                      {
                        c = "address_pickup";
                      }
                      else if (req.body.status == "address_pickup_start")
                      {
                        c = "address_pickup_start";
                      }
                      else if (req.body.status == "address_delivery_not_ready")
                      {
                        c = "address_delivery_not_ready";
                      }
                      var jso = {
                        user:"api",
                        ip: ipa,
                        timestamp: Math.floor(new Date() / 1000),
                        code: c,
                        orderID:req.body.orderID,
                        deliveryID: req.body.deliveryID,
                        companyID: ord.companyID,
                        vehicleID:req.body.vehicleID
                      };
											//console.log(jso);
                      log.logThis(jso);
                      sendStatusChange(req.body.orderID,c,ord.companyID);
                      sendStatusChange2(req.body.orderID,c);
                      res.json(deliverys);

                     });

                });
              }
              else {
                res.json({'error':'Delivery not found'});
              }
            });
          }
          });
        }
        else {
          res.json({'error':'Delivery not found'});
        }
      });
    }
    else if (req.body.status == "inProgress" && req.body.pincode != null && req.body.pincode.length > 5)
    {
      dc.findOne({orderID:req.body.orderID,type:"pickup"}, function(err, d) {
        if (err)
        {
          res.json({'error':'Delivery not found'});
        }
        if (d != undefined && d != null && req.body.pincode == d.pin)
        {
          dc.findOneAndUpdate({orderID:req.body.orderID,type:"pickup"},{status:"verified"},{new: true}, function(err2, da) {
            if (err2)
            {
              res.json({'error':'Delivery not found'});
            }
            else
            {
              var query = { _id: req.body.deliveryID };
            	var update = { vehicleID:req.body.vehicleID,status: req.body.status, time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
              Deliverys.find({_id:req.body.deliveryID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
                if (deli != undefined && deli.length > 0)
                {
                  Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
                    if(err)
                    {
                      res.send(err);
                    }
                    var oQuery = { _id: req.body.orderID };
                    var oUpdate = { status: req.body.orderStatus };
                    Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
                    {
                      if (err2)
                      {
                        res.send(err2);
                      }
                      var log = require('../controllers/orderLogController');
                      var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                      var c = "";
                      if (req.body.status == "accepted" || req.body.status == 'box_accepted')
                      {
                        c = "driver_accept";
                      }
                      else if (ord.destination == "box_address" && req.body.status == "inProgress")
                      {
                        c = "driver_pickup_box_address"
                      }
                      else if (ord.destination == "group_free" && req.body.status == "inProgress")
                      {
                        c = "driver_pickup_box_address"
                      }
                      else if (req.body.status == "inProgress")
                      {
                        c = "driver_pickup";
                      }
                      else if (req.body.status == "cancelled" || req.body.status == 'box_cancelled')
                      {
                        c = "driver_cancel";
                      }
                      else if (req.body.status == "done")
                      {
                        c = "driver_delivery";
                      }
                      else if (req.body.status == "delivery_ready")
                      {
                        c = "delivery_ready";
                      }
                      else if (req.body.status == "delivery_not_ready")
                      {
                        c = "delivery_not_ready";
                      }
                      else if (req.body.status == "address_pickup_accepted")
                      {
                        c = "address_pickup_accepted";
                      }
                      else if (req.body.status == "address_pickup")
                      {
                        c = "address_pickup";
                      }
                      else if (req.body.status == "address_pickup_start")
                      {
                        c = "address_pickup_start";
                      }
                      else if (req.body.status == "address_delivery_not_ready")
                      {
                        c = "address_delivery_not_ready";
                      }
                      var jso = {
                        user:"api",
                        ip: ipa,
                        timestamp: Math.floor(new Date() / 1000),
                        code: c,
                        orderID:req.body.orderID,
                        deliveryID: req.body.deliveryID,
                        companyID: ord.companyID,
                        vehicleID:req.body.vehicleID
                      };
                      log.logThis(jso);
                      sendStatusChange(req.body.orderID,c,ord.companyID);
                      sendStatusChange2(req.body.orderID,c);
                      res.json(deliverys);

                     });

                });
              }
              else {
                res.json({'error':'Delivery not found'});
              }
            });
          }
          });
        }
        else {
          res.json({'error':'Delivery not found'});
        }
      });
    }
    else {


      var query = { _id: req.body.deliveryID };
    	var update = { vehicleID:req.body.vehicleID,status: req.body.status, time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
      Deliverys.find({_id:req.body.deliveryID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
        if (deli != undefined && deli.length > 0)
        {
          Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
            if(err)
            {
              res.send(err);
            }
            var oQuery = { _id: req.body.orderID };
            var oUpdate = { status: req.body.orderStatus };
            Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
            {
              if (err2)
              {
                res.send(err2);
              }
              var log = require('../controllers/orderLogController');
              var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
              var c = "";
              if (req.body.status == "accepted" || req.body.status == 'box_accepted')
              {
                c = "driver_accept";
              }
              else if (req.body.status == "inProgress")
              {
                c = "driver_pickup";
              }
              else if (req.body.status == "cancelled" || req.body.status == 'box_cancelled')
              {
                c = "driver_cancel";
              }
              else if (req.body.status == "done")
              {
                c = "driver_delivery";
              }
              else if (req.body.status == "delivery_ready")
              {
                c = "delivery_ready";
              }
              else if (req.body.status == "delivery_not_ready")
              {
                c = "delivery_not_ready";
              }
              else if (req.body.status == "address_pickup_accepted")
              {
                c = "address_pickup_accepted";
              }
              else if (req.body.status == "address_pickup")
              {
                c = "address_pickup";
              }
              else if (req.body.status == "address_pickup_start")
              {
                c = "address_pickup_start";
              }
              else if (req.body.status == "address_delivery_not_ready")
              {
                c = "address_delivery_not_ready";
              }
              var jso = {
                user:"api",
                ip: ipa,
                timestamp: Math.floor(new Date() / 1000),
                code: c,
                orderID:req.body.orderID,
                deliveryID: req.body.deliveryID,
                companyID: ord.companyID,
                vehicleID:req.body.vehicleID
              };
              log.logThis(jso);
              sendStatusChange(req.body.orderID,c,ord.companyID);
              sendStatusChange2(req.body.orderID,c);
              res.json(deliverys);

             });

        });
        }
        else {
          res.json({'error':'Delivery not found'});
        }
      });
    }
  }

};

exports.driver_create_a_deliverys = function(req, res) {
	var new_deliverys = new Deliverys({
		"vehicleID": req.body.vehicleID,
		"orderID": req.body.orderID,
		"companyID":req.body.companyID,
		"status":req.body.status,
		"start":"address"
	});

	Deliverys.find({orderID:req.body.orderID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
		if (deli == undefined || deli == null || deli.length < 1)
		{
			new_deliverys.save(function(err, deliverys22) {

				var update = { vehicleID:req.body.vehicleID,status: "accepted", time: {pickupTime: req.body.pickupTime, deliveryTime: req.body.deliveryTime} };
				Deliverys.find({orderID:req.body.orderID,vehicleID:req.body.vehicleID, status: {$nin:['cancelled','done','box_cancelled','terminal_stop']}, companyID:req.body.companyID}, function(err, deli){
					if (deli.length > 0)
					{
						var query = { _id: deli[0]._id };
						Deliverys.findOneAndUpdate(query,update, function(err, deliverys){
							if(err)
							{
								res.send(err);
							}
							var oQuery = { _id: req.body.orderID };
							var oUpdate = { status: "accepted" };
							Orders.findOneAndUpdate(oQuery, oUpdate, function(err2, ord)
							{
								if (err2)
								{
									res.send(err2);
								}
								var log = require('../controllers/orderLogController');
								var ipa = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
								var c = "";

								c = "group_address_pickup_accepted";
								var jso = {
									user:"api",
									ip: ipa,
									timestamp: Math.floor(new Date() / 1000),
									code: c,
									orderID:req.body.orderID,
									deliveryID: deliverys._id,
									companyID: ord.companyID,
									vehicleID:req.body.vehicleID
								};
								log.logThis(jso);
								sendStatusChange(req.body.orderID,c,ord.companyID);
								sendStatusChange2(req.body.orderID,c);
								res.json(deliverys);

							 });

					});
					}
					else {
						res.json({'error':'Delivery not found'});
					}
				});
			});
		}
		else {
			res.json({'error':'Delivery not found'});
		}
	});
};


function sendStatusChange(orderID,status,comp)
{
  var envi = "test";
  if (environment.port == 3000)
  {
    envi = "prod";
  }

    var jso = {
      "orderID":orderID,
      "status":status,
      "companyID":comp,
      "environment":envi
    };
    var request = require('request');
  	var options = {
  		uri: "https://localhost:5140/webhook",
  		method: 'POST',
      rejectUnauthorized: false,
  		headers: {
          "content-type": "application/json",
          },
  		json: jso
  	};
  	request(options, function (error, response, body) {
  	  if (!error && response.statusCode == 200) {

  	  }
  	  else
  	  {
  		  console.log(response);
  	  }
  	});
}
function sendStatusChange2(orderID,status)
{
  var toport = "3511";
  if (environment.port == 3000)
  {
    toport = "3501";
  }
  else {
    toport = "3511"
  }

    var jso = {
      "orderID":orderID,
      "status":status
    };
    var request = require('request');
  	var options = {
  		uri: "https://localhost:"+toport+"/webhook",
      rejectUnauthorized: false,
  		method: 'POST',
  		headers: {
          "content-type": "application/json",
          },
  		json: jso
  	};
  	request(options, function (error, response, body) {
  	  if (!error && response.statusCode == 200) {

  	  }
  	  else
  	  {
  		  console.log(response);
  	  }
  	});
}
