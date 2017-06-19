'use strict';
var alexa = require('alexa-app'); //require alexa app

module.change_code = 1; // Allow this module to be reloaded by hotswap when changed
var app = new alexa.app('oily');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();


// Launch Intent
app.launch(function(req, res) {
  var prompt = "Hi there! I can check the oil level or order for a refill. Which one will it be?"
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});


// Oil level and Stats Intent
app.intent('OilLevel', {
  "slots": {
    "Status": "LITERAL",
  }
}, function(req, res) {
  var status = req.slot('Status').toLowerCase();
  console.log('variable slot', status)
  switch (status) {

    case 'what is todays oil level':
    case 'check the oil level':
    case 'what is the present oil level':
      var reading = databaseHelper.readOilLevel();
      return reading.then(function(result) {
        var oilPercentage = calculateLevel(result[1]);
        console.log('oilPercentage', oilPercentage);
        if (oilPercentage < 20) {
          var usage = oilStats(result)
          res.say('present oil level is ' + oilPercentage + ' percent. with the current usage rate of ' + usage[0] + ' gallons, oil can last for another ' + usage[1] + ' days. you might want to consider ordering for a refill. should i order for a refill?').shouldEndSession(false);
        } else {
          res.say('present oil level is ' + oilPercentage + ' percent.').shouldEndSession(false);
        }
      });
      break;

    case 'what is todays oil usage':
    case 'what is the oil usage':
      var reading = databaseHelper.readOilLevel();
      return reading.then(function(result) {
        var usage = oilStats(result)
        res.say('For today, till now, ' + usage[0] + ' gallons has been consumed.').shouldEndSession(false);
      });
      break;

    case 'for how many days can the oil last':
    case 'how many days can the oil last':
      var reading = databaseHelper.readOilLevel();
      return reading.then(function(result) {
        var usage = oilStats(result)
        res.say('Oil can last for another ' + usage[1] + ' days with the current usage rate.').shouldEndSession(false);
      });
      break;

    case 'order for a refill':
    case 'order me a refill':
      res.say('how many gallons shall i order?').shouldEndSession(false);
      break;

    case 'order for two gallons':
    case 'order for one gallons':
    case 'order for three gallons':
    case 'order for five gallons':
    case 'order for ten gallons':
    case 'order for fifteen gallons':
    case 'order for twenty gallons':
      res.say('sure. i just placed the order. the refill should be here within 48 hours.').shouldEndSession(false);
      break;

    case 'ok thank you':
    case 'thank you':
      res.say('you\'re welcome. Goodbye').shouldEndSession(true);
      break;

    default:
      res.say("sorry, i did not understand that. can you please repeat it?").shouldEndSession(false);
  }
});


// AMAZON YES Intent
app.intent('AMAZON.YesIntent',
  function(req, res) {
    var prompt = "how many gallons shall i order?";
    res.say(prompt).shouldEndSession(false).send();
  }
);


// AMAZON NO Intent
app.intent('AMAZON.NoIntent',
  function(req, res) {
    var response = "Okay. Thanks.";
    res.say(response).shouldEndSession(true);
  }
);


// Help Intent
app.intent('AMAZON.HelpIntent',
  function(req, res) {
    var help = "You can ask me to check the oil level or order for a refill. If not, you can say stop to exit from the skill.";
    res.say(help).shouldEndSession(false);

  });


// Stop Intent
app.intent('AMAZON.StopIntent',
  function(req, res) {
    var goodbye = "Had a nice time talking to you. Goodbye.";
    res.say(goodbye).shouldEndSession(true);

  });

//-------------------------------------------Functions-----------------------------------------------//

function calculateLevel(result) {
  var total = 18;
  var present = result;
  var percent = Math.round((((total - present) / 13) * 100));
  return percent;
}

function oilStats(result) {
  var initial = result[0];
  var final = result[1];
  var oilUsage = ((final - initial) * 0.1538).toFixed(2);
  var daysPrediction = Math.round(2 / oilUsage);
  return [oilUsage, daysPrediction];
}

//-------------------------------------------Functions-----------------------------------------------

module.exports = app;