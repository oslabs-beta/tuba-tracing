const fs = require('fs');
const yaml = require('js-yaml');
const tubaDB = require('./tubaModel');
require('dotenv').config();



async function tuba_getServiceID(jobName) {

    let ID = 0

    return tubaDB.query(
        `SELECT * FROM services WHERE srv_name = '${jobName}';`
    )
    .then(json => {
        ID = json.rows[0].srv_id;
        console.log(json.rows[0].srv_id);
        return ID;
    });
}

async function tuba_SaveError(tubaError) {

    console.log('TUBA ERROR >>>>', tubaError);

    const query = `INSERT INTO error_data (
err_srv_id,
err_job_name,
err_time,
err_message,
err_type,
err_stack,
err_file_path,
err_file,
err_line_num,
err_module,
err_module_function
) 
VALUES(
${tubaError.serviceID},
'${tubaError.jobName}',
${tubaError.err_time},
'${tubaError.err_message}',
'${tubaError.err_type}',
'${tubaError.err_stack}',
'${tubaError.err_file_path}',
'${tubaError.err_file}',
${tubaError.err_line_num},
'${tubaError.err_module}',
'${tubaError.err_module_function}'
);`;

tubaDB.query(query).then(data => console.log(data));

}

async function tuba_parseRangeError(err, tubaError) {

    // console.log(err);

    let layerIndex;

    // split the stack on new lines
    const stack = err.stack ? err.stack.split('\n') : 'stack unavailable!';

    // console.log('message >>>>', err.message)
    // console.log('tuba message >>>>', tubaError.err_message)

    if(err.message === 'The number Infinity cannot be converted to a BigInt because it is not an integer'
        || err.message === 'Invalid code point Infinity'
        || err.message === 'Invalid time value'
        || err.message === 'toExponential() argument must be between 0 and 100'
        || err.message === 'toFixed() digits argument must be between 0 and 100'
        || err.message === 'toPrecision() argument must be between 1 and 100'
        || err.message === 'toString() radix argument must be between 2 and 36'
        || err.message === 'Invalid count value'
        || err.message === 'Invalid string length'
        || err.message.includes('cannot be converted to a BigInt because it is not an integer')) {
        layerIndex = 2;
    } else {
        layerIndex = 1
    }

    // const layerIndex = 1;
    const layer1 = stack[layerIndex];
    // const layer2 = stack[2]
    
    // parse file path and file name
    const filePath = layer1.split('/');
    filePath.shift();
    tubaError.err_file_path = filePath.join('/');
    tubaError.err_file = layer1.slice(layer1.lastIndexOf('/') + 1, layer1.indexOf(':'));

    // get the jobName from prometheus.yaml
    const yamlData = yaml.load(fs.readFileSync('prometheus.yaml', 'utf8'));
    const jobName = yamlData.scrape_configs[0].job_name;
    tubaError.jobName = jobName

    // query the db for the srv_id of the service where this error is occurring
    tubaError.serviceID = await tuba_getServiceID(jobName);

    // get the npm module and function within that module
    for(let i = 0; i < stack.length; i++) {

        const layer = stack[i];

        // match the text'node_modules' then capture whatever comes after that before the next '/'
        const module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer);

        // if we don't find the module, then try the next layer in the stack
        if(!module || !module[1]) {
            continue;
        } else {
            tubaError.err_module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer)[1];
            tubaError.err_module_function = RegExp(/\[(.*?)\]/).exec(layer)[1];
            break;
        }

    }

    // get the line number in the user's file where the error happened
    tubaError.err_line_num = layer1.slice(layer1.indexOf(':')+1, layer1.lastIndexOf(':'));

    console.log('tubaError >>>>> ', tubaError);

    tuba_SaveError(tubaError);

}

// async function tuba_parseRangeError(err, tubaError) {
//     console.log('RangeError in tuba_parseRangeError', err);

// }

async function tuba_parseReferenceError(err, tubaError) {
    // console.log('ReferenceError in tuba_parseReferenceError', err);
    
    // create layerIndex
    let layerIndex;

    // split the stack on new lines
    const stack = err.stack ? err.stack.split('\n') : 'stack unavailable!';

    if (err.message.includes('is not defined')
      || err.message.includes('assignment to undeclared variable')
      || err.message.includes('reference to undefined property')
      ) {
        layerIndex = 2;
        // console.log('layerIndex >>>> 2');
    } else {
        layerIndex = 1;
        // console.log('layerIndex >>> 1');
    }

    // const layerIndex = tubaError.err_type === 'RangeError' ? 2 : 1;
    // const layerIndex = 1;
    const layer1 = stack[layerIndex];
    // const layer2 = stack[2]
    
    // parse file path and file name
    const filePath = layer1.split('/');
    filePath.shift();
    tubaError.err_file_path = filePath.join('/');
    tubaError.err_file = layer1.slice(layer1.lastIndexOf('/') + 1, layer1.indexOf(':'));

    // get the jobName from prometheus.yaml
    const yamlData = yaml.load(fs.readFileSync('prometheus.yaml', 'utf8'));
    const jobName = yamlData.scrape_configs[0].job_name;
    tubaError.jobName = jobName

    // query the db for the srv_id of the service where this error is occurring
    tubaError.serviceID = await tuba_getServiceID(jobName);

    // get the npm module and function within that module
    for(let i = 0; i < stack.length; i++) {

        const layer = stack[i];

        // match the text'node_modules' then capture whatever comes after that before the next '/'
        const module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer);

        // if we don't find the module, then try the next layer in the stack
        if(!module || !module[1]) {
            continue;
        } else {
            tubaError.err_module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer)[1];
            tubaError.err_module_function = RegExp(/\[(.*?)\]/).exec(layer)[1];
            break;
        }

    }

    // get the line number in the user's file where the error happened
    tubaError.err_line_num = layer1.slice(layer1.indexOf(':')+1, layer1.lastIndexOf(':'));

    // console.log('tubaError >>>>> ', tubaError)

    tuba_SaveError(tubaError);

}








async function tuba_parseSyntaxError(err, tubaError) {

    let layerIndex;
    let JSONParseRegex = /Unexpected \w+ in JSON at position \d+/i;
    let JSONParseTokenRegex = /Unexpected \w+ . in JSON at position \d+/i;
    let bigIntConvertRegex = /Cannot convert \S+ to a BigInt/i;
    let UnexpectedTokenRegex = /Unexpected token '\S+'/i;

    // split the stack on new lines
    const stack = err.stack ? err.stack.split('\n') : 'stack unavailable!';

    // console.log('message >>>>', err.message)
    // console.log('tuba message >>>>', tubaError.err_message)

    if(err.message.includes('qwerty') 
        || JSONParseRegex.test(err.message)
        || JSONParseTokenRegex.test(err.message)
        || bigIntConvertRegex.test(err.message)
        || UnexpectedTokenRegex.text(err.message)) {
        layerIndex = 2;
    } else {
        layerIndex = 1
    }

    // const layerIndex = 1;
    const layer1 = stack[layerIndex];
    // const layer2 = stack[2]
    
    // parse file path and file name
    const filePath = layer1.split('/');
    filePath.shift();
    tubaError.err_file_path = filePath.join('/');
    tubaError.err_file = layer1.slice(layer1.lastIndexOf('/') + 1, layer1.indexOf(':'));

    // get the jobName from prometheus.yaml
    const yamlData = yaml.load(fs.readFileSync('prometheus.yaml', 'utf8'));
    const jobName = yamlData.scrape_configs[0].job_name;
    tubaError.jobName = jobName

    // query the db for the srv_id of the service where this error is occurring
    tubaError.serviceID = await tuba_getServiceID(jobName);

    // get the npm module and function within that module
    for(let i = 0; i < stack.length; i++) {

        const layer = stack[i];

        // match the text'node_modules' then capture whatever comes after that before the next '/'
        const module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer);

        // if we don't find the module, then try the next layer in the stack
        if(!module || !module[1]) {
            continue;
        } else {
            tubaError.err_module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer)[1];
            tubaError.err_module_function = RegExp(/\[(.*?)\]/).exec(layer)[1];
            break;
        }

    }

    // get the line number in the user's file where the error happened
    tubaError.err_line_num = layer1.slice(layer1.indexOf(':')+1, layer1.lastIndexOf(':'));

    console.log('tubaError >>>>> ', tubaError);

    tuba_SaveError(tubaError);
}











async function tuba_parseURIError(err, tubaError) {
    console.log('URIError in tuba_parseURIError', err);

    // create layerIndex
    let layerIndex;

    // split the stack on new lines
    const stack = err.stack ? err.stack.split('\n') : 'stack unavailable!';

    if (err.message.includes('URI malformed')
      || err.message.includes('String contained an illegal UTF-16 sequence')
      ) {
      layerIndex = 2;
      console.log('layerIndex >>>>> 2')
    } else {
      layerIndex = 1;
      console.log('layerIndex >>>> 1')
    }

    // const layerIndex = tubaError.err_type === 'RangeError' ? 2 : 1;
    //  const layerIndex = 1;
    const layer1 = stack[layerIndex];
    // const layer2 = stack[2]
    
    // parse file path and file name
    const filePath = layer1.split('/');
    filePath.shift();
    tubaError.err_file_path = filePath.join('/');
    tubaError.err_file = layer1.slice(layer1.lastIndexOf('/') + 1, layer1.indexOf(':'));

    // get the jobName from prometheus.yaml
    const yamlData = yaml.load(fs.readFileSync('prometheus.yaml', 'utf8'));
    const jobName = yamlData.scrape_configs[0].job_name;
    tubaError.jobName = jobName

    // query the db for the srv_id of the service where this error is occurring
    tubaError.serviceID = await tuba_getServiceID(jobName);

    // get the npm module and function within that module
    for(let i = 0; i < stack.length; i++) {

        const layer = stack[i];

        // match the text'node_modules' then capture whatever comes after that before the next '/'
        const module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer);

        // if we don't find the module, then try the next layer in the stack
        if(!module || !module[1]) {
            continue;
        } else {
            tubaError.err_module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer)[1];
            tubaError.err_module_function = RegExp(/\[(.*?)\]/).exec(layer)[1];
            break;
        }
    }

    // get the line number in the user's file where the error happened
    tubaError.err_line_num = layer1.slice(layer1.indexOf(':')+1, layer1.lastIndexOf(':'));

    console.log('tubaError >>>>> ', tubaError)

    tuba_SaveError(tubaError);
}



async function tuba_parseTypeError(err, tubaError) {
    console.log('TypeError in tuba_parseTypeError', err);
    // create layerIndex
    let layerIndex;
    // split the stack on new lines
    const stack = err.stack ? err.stack.split('\n') : 'stack unavailable!';
    if(err.message === 'Assignment to constant variable'
      || err.message === 'x is not iterable'
      || err.message.includes('Cannot read properties of null')
      || err.message.includes('Object prototype may only be an Object or null')
      || err.message.includes('is not a constructor')
      || err.message.includes('is not a function')
      || err.message.includes('Property description must be an object')
      || err.message.includes('Cannot assign to read only property')
      || err.message.includes('Cannot create property')
      || err.message.includes('Cannot mix BigInt and other types')
      || err.message === RegExp('/^(?=.*\bcannot convert\b)(?=.*\bto a BigInt\b).*$/')
      || err.message.includes('to a BigInt')
      || err.message.includes('object is not extensible')
      || err.message.includes('Cannot delete property')
      || err.message.includes('Cannot redefine property')
      || err.message.includes('Cyclic __proto__ value')
      || err.message.includes('Cannot use \'in\' operator to search for \'x\' in \'y\'')
      || err.message.includes('Right-hand side of \'instanceof\' is not an object')
      || err.message.includes('The comparison function must be either a function or undefined')
      || err.message.includes('Assignment to constant variable')
      || err.message.includes('Object prototype may only be an Object or null')
      || err.message.includes('Reduce of empty array with no initial value')
      || err.message.includes('setting getter-only property')
      ) {
        layerIndex = 2;
        // console.log('layerIndex >>>> 2');
    } else if (err.message.includes('Converting circular structure to JSON')
    || err.message.includes('called on incompatible receiver')
    ) {
        layerIndex = 4;
        // console.log('layerIndex >>>> 3');
        // console.log('stack >>>>> ', stack);
    } else {
        layerIndex = 1;
        // console.log('layerIndex >>> 1');
    }
     // const layerIndex = tubaError.err_type === 'RangeError' ? 2 : 1;
    //  const layerIndex = 1;
     const layer1 = stack[layerIndex];
     // const layer2 = stack[2]
     // parse file path and file name
     const filePath = layer1.split('/');
     filePath.shift();
     tubaError.err_file_path = filePath.join('/');
     tubaError.err_file = layer1.slice(layer1.lastIndexOf('/') + 1, layer1.indexOf(':'));
     // get the jobName from prometheus.yaml
     const yamlData = yaml.load(fs.readFileSync('prometheus.yaml', 'utf8'));
     const jobName = yamlData.scrape_configs[0].job_name;
     tubaError.jobName = jobName
     // query the db for the srv_id of the service where this error is occurring
     tubaError.serviceID = await tuba_getServiceID(jobName);
     // get the npm module and function within that module
     for(let i = 0; i < stack.length; i++) {
         const layer = stack[i];
         // match the text'node_modules' then capture whatever comes after that before the next '/'
         const module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer);
         // if we don't find the module, then try the next layer in the stack
         if(!module || !module[1]) {
             continue;
         } else {
             tubaError.err_module = RegExp(/\/node_modules\/([^\/]+)/).exec(layer)[1];
             tubaError.err_module_function = RegExp(/\[(.*?)\]/).exec(layer)[1];
             break;
         }
     }
     // get the line number in the user's file where the error happened
     tubaError.err_line_num = layer1.slice(layer1.indexOf(':')+1, layer1.lastIndexOf(':'));
     console.log('tubaError >>>>> ', tubaError)

     tuba_SaveError(tubaError);
}



module.exports = { 

    tuba_ParseRouter: function(err) {

        console.log('type >>>> ', err.name);

        
        const tubaError = {
            err_time: null,
            err_message: null,
            err_type: null,
            err_stack: null,
            err_file_path: null,
            err_file: null,
            err_line_num: null,
            err_module: null,
            err_module_function: null,
            jobName: null,
            serviceID: null,
        }

        // get the time in milliseconds
        tubaError.err_time = Date.now();

        // parse the stack
        tubaError.err_stack = err.stack ? encodeURIComponent(err.stack.replaceAll('\'', '"')) : 'stack unavailable!';

        // get name and message
        tubaError.err_type = err.name;
        tubaError.err_message = encodeURIComponent(err.message.replaceAll('\'', '"'));

       switch (err.name) {
        case 'SyntaxError':
            tuba_parseSyntaxError(err, tubaError);
            break;
        case 'RangeError':
            tuba_parseRangeError(err, tubaError);
            break;
        case 'ReferenceError':
            tuba_parseReferenceError(err, tubaError);
            break;
        case 'TypeError':
            tuba_parseTypeError(err, tubaError);
            break;
        case 'URIError':
            tuba_parseURIError(err, tubaError);
            break;
        default:
            console.log('parseError.js tuba_ParseRouter, err.name: ', err.name);
            break;
       }
    } 
}