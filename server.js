'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

const helmet = require('helmet')

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet()) //we use helmet for security

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//app routes --------------------------------------
app.route('/api/convert').get((req,res)=>{
  const conversions={    //we set the conversion constants
    galL: 3.78541,
    lbskg: 0.453592,
    mikm: 1.60934
  }
  
  let input= req.query.input;
  console.log(input);
  
  let indexOfChar=input.match(/[a-z]/i).index;
  let indexOfSlash=input.match(/\//);  //we search for a match for slash
  indexOfSlash=(indexOfSlash? indexOfSlash.index : -1);  //if we find one we set indexOfSlash as the index of the match, else we set it as -1
  
  let number;    //derivate the number from the text, checking for fractions
  if(indexOfSlash==-1){
    number=input.slice(0,indexOfChar);
  } else {
    let n1=input.slice(0,indexOfSlash);
    let n2=input.slice(indexOfSlash+1,indexOfChar);
    number=n1/n2;
  } 
  
  let inValue={
    number:number,
    type:input.slice(indexOfChar)
  }
  
  if(!inValue.number&&!inValue.type){
    res.json({error: "invalid number and unit"});
  } else if(!(inValue.number/1)){
    res.json({error: "invalid number"});
  }
  
  console.log(inValue)
  
  let outValue={
    number:0,
    type:''
  }
  
  switch(inValue.type){
    case 'gal':
      outValue.number=inValue.number*conversions.galL;
      outValue.type='L';
      break;
    case 'L':
      outValue.number=inValue.number/conversions.galL;
      outValue.type='gal';
      break;
    case 'lbs':
      outValue.number=inValue.number*conversions.lbskg;
      outValue.type='kg';
      break;
    case 'kg':
      outValue.number=inValue.number/conversions.lbskg;
      outValue.type='lbs';
      break;
    case 'mi':
      outValue.number=inValue.number*conversions.mikm;
      outValue.type='km';
      break;
    case 'km':
      outValue.number=inValue.number/conversions.mikm;
      outValue.type='mi';
      break;
    default:
      res.json({error: "invalid unit"})
  }
  let converting=Math.round(inValue.number * 100000) / 100000 + " " + inValue.type + " converts to " + Math.round(outValue.number * 100000) / 100000 + " " + outValue.type;
  res.json({
    initValue: inValue.number,
    initUnit: inValue.type,
    returnValue: outValue.number,
    returnUnit: outValue.type,
    conversion:converting
  })
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing

          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
