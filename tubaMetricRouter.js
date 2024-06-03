// any time an error occurs, route through the tubeMetricRouter to determine which prometheus method is invoked
const {totalErrorsCounter, syntaxErrorsCounter, referenceErrorsCounter, rangeErrorsCounter, typeErrorsCounter, uriErrorsCounter} = require('./prometheus_methods');
const {tuba_ParseRouter} = require('./parseError')
const { 
  syntaxErrorTests,
  typeErrorTests,
  rangeErrorTests,
  referenceErrorTests,
  uriErrorTests 
} = require('./errorTests');

function tubaMetricRouter(err, service) {
  // parse error, store in tubaError 
  const tubaError = {
    error_type: err.name, 
    error_stack: err.stack,
    error_message: err.message,
    exact_time: new Date().getTime(),
    service: service
  }

  // this pushes to the database with relevant info
  tuba_ParseRouter(err);

  //invoke totalErrorsCounter
  totalErrorsCounter.inc();

  // console.log('error in the metrics router >>> ', err)

  // check error types and route accordingly
  if (tubaError.error_type == 'SyntaxError') {
    console.log('syntax error!!!!!');
    //invoke syntaxErrorsCounter
    // syntaxErrorsCounter(tubaError);
    syntaxErrorsCounter.labels(tubaError).inc();
  }
  if (tubaError.error_type == 'TypeError') {
    //invoke typeErrorsCounter
    typeErrorsCounter.labels(tubaError).inc();
  }
  if (tubaError.error_type == 'RangeError') {
    //invoke rangeErrorsCounter
    rangeErrorsCounter.labels(tubaError).inc();
  }
  if (tubaError.error_type == 'ReferenceError') {
    //invoke referenceErrorsCounter
    referenceErrorsCounter.labels(tubaError).inc();
  }
  if (tubaError.error_type == 'URIError') {
    console.log('URI error!!!!');
    //invoke uriErrorsCounter
    uriErrorsCounter.labels(tubaError).inc();
  }
};

module.exports = {
    tubaMetricRouter: tubaMetricRouter,
    // syntaxErrorTests: syntaxErrorTests,
    // typeErrorTests: typeErrorTests,
    // rangeErrorTests: rangeErrorTests,
    // referenceErrorTests: referenceErrorTests,
    // uriErrorTests: uriErrorTests
  }