const promClient = require('prom-client');


module.exports = {
    httpRequestDurationMicroseconds: new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.1, 0.3, 1, 1.5, 3, 5, 10]
      }),
    // total errors, needs refactoring 
    totalErrorsCounter: new promClient.Counter({
        name: 'total_errors_total',
        help: 'Total count of errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),

    // syntax errors
    syntaxErrorsCounter : new promClient.Counter({
        name: 'syntax_errors_total',
        help: 'Total count of syntax errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),
      
    // typeErrorsCounter
    typeErrorsCounter : new promClient.Counter({
        name: 'type_errors_total',
        help: 'Total count of type errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),

    // rangeErrorsCounter
    rangeErrorsCounter : new promClient.Counter({
        name: 'range_errors_total',
        help: 'Total count of range errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),

    // referenceErrorsCounter
    referenceErrorsCounter : new promClient.Counter({
        name: 'reference_errors_total',
        help: 'Total count of reference errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),

    // uriErrorsCounter, malformed uri sequence (when uri encoding or decoding was not successful)
    uriErrorsCounter : new promClient.Counter({
        name: 'uri_errors_total',
        help: 'Total count of uri errors in the application',
        labelNames: ['error_type', 'error_message', 'error_stack', 'exact_time', 'err_job_name', 'service']
      }),

}