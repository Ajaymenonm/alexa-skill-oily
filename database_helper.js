'use strict';
module.change_code = 1;
var OILY_DATA_TABLE_NAME = 'IoTData'; // Table name

// connect to dynamo db
var credentials = {
  accessKeyId: 'ABCD1234xxxxxxxxxxxx',
  secretAccessKey: 'kjler98774kjergxxxxxxxxxxkhwgerg9842o38'
};
var dynasty = require('dynasty')(credentials);
// connect to dynamo db

function OilyHelper() {}

var oilyDataTable = function() {
  return dynasty.table(OILY_DATA_TABLE_NAME);
};

// Read data from Dynamo
OilyHelper.prototype.readOilLevel = function() {
  return oilyDataTable().findAll('IoTDevice')
    .then(function(result) {
      var a = result.length;
      console.log(result[0])
      var initialLevel = result[0].data.state.reported.Tank_Level;
      var finalLevel = result[a - 1].data.state.reported.Tank_Level;
      console.log('database tank level initial: ', initialLevel);
      console.log('database tank level final: ', finalLevel);
      return [initialLevel, finalLevel];
    })
    .catch(function(error) {
      console.log('error from dynamo', error);
    });
};

module.exports = OilyHelper;