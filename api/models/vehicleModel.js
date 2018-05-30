'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var VehicleSchema = new Schema({
  _id: 
    {
    type: String,
    required: 'Please enter the vehicle identifier'
  },
  registerNumber: 
    {
    type: String,
    required: 'Please enter the vehicle registernumber'
  },
  type: 
  {
    type: String,
    default:  ['Car']
  },
  updateDate: 
    {
    type: Date,
    default: Date.now
  },
  status: 
  {
    type: [{
      type: String,
      enum: ['online', 'offline']
    }],
    default: ['offline']
  },
  state: 
  {
    type: [{
      type: String,
      enum: ['booked', 'available']
    }],
    default: ['available']
  },
  longitude: 
  {
	  type: Number,		//sijainti
      default: 0.0
  },
  latitude: 
  {
	  type: Number,	
      default: 0.0
  },
});

module.exports = mongoose.model('Vehicles', VehicleSchema);

