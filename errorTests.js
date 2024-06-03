
function syntaxErrorTests() {
    
    // unexpectred token
    JSON.parse("[1, 2, 3, 4,]");
    JSON.parse('{"foo": 1,}');

    // 
    // JSON.parse('{"foo": 01}');

    // SyntaxError: Unexpected '#' used outside of class body
    // class ClassWithPrivateField {
    //     #privateField;
    //     constructor() {}
    //   }
    //   this.#privateField = 42;

    // SyntaxError: Using //@ to indicate sourceURL pragmas is deprecated. Use //# instead
    // @ sourceMappingURL=http://example.com/path/to/your/sourcemap.map

    // SyntaxError: a declaration in the head of a for-of loop can't have an initializer
    // const iterable = [10, 20, 30];
    // for (const value = 50 of iterable) {
    // console.log(value);
    // }

    // SyntaxError: applying the 'delete' operator to an unqualified name is deprecated
    // "use strict";
    // var x;
    // delete x;

}

function typeErrorTests() {
// TypeError assigment to const
    // const num = 7
    // num = '7';

// TypeError- x is not iterable
    // function iterableTest() {
    //   const x = 1
    //   for (const i of x) {
    //     console.log(i);
    //   }
    // }
    // iterableTest();

// TypeError- x has no properties
    // console.log('type error- x has no properties', null.tuba) 
    // console.log('type error- x has no properties', undefined.tuba)

// TypeError- x is not y
    const tubaXY = "string";
    Object.create(tubaXY);

// TypeError- x is not a constructor
    // const tubaCon = 4
    // new tubaCon()

// TypeError- x is not a function
    // const notArray = {1: 'a', 2: 'b'}
    // notArray.map((num) => num + 2)

// TypeError- x is not a non-null Object
// Object.defineProperty({}, "key", null);

// TypeError- can't convert BigInt to number
// const sum = 1n + 1;

// TypeError- x can't be converted to BigInt
// const a = BigInt(null);

// TypeError- can't redefine non-configurable property
// const obj = Object.create({});
// Object.defineProperty(obj, "tuba", { value: "horn" });
// Object.defineProperty(obj, "tuba", { value: "hornz" });

// TypeError- can't set prototype: it would cause a prototype chain cycle
// const a = {};
// const b = {};
// const c = {};
// Object.setPrototypeOf(a, b);
// Object.setPrototypeOf(b, c);
// Object.setPrototypeOf(c, a);

// TypeError- "right-hand side of 'in' should be an object"
// "Hello" in "Hello World";

// TypeError- cyclic object value, Converting circular structure to JSON
// const circularReference = { otherData: 123 };
// circularReference.myself = circularReference;
// JSON.stringify(circularReference);

// TypeError- "right-hand side of 'instanceof' is not an object"
// "test" instanceof ""; 
// 42 instanceof 0; 

// TypeError- "invalid Array.prototype.sort argument", The comparison function must be either a function or undefined
// [1, 3, 2].sort(5);

// TypeError- "invalid assignment to const", Assignment to constant variable
// const num = 7;
// num = 8;

// TypeError- more arguments needed, Object prototype may only be an Object or null
// const obj = Object.create();

// TypeError- Reduce of empty array with no initial value
// const ints = [0, -1, -2, -3, -4, -5];
// ints
//   .filter((x) => x > 0) // removes all elements
//   .reduce((x, y) => x + y); // no more elements to use for the initial value.

// TypeError- 'called on incompatible receiver', occurs when a function (on a given object), is called with a This not corresponding to the type expected by the function.
// const mySet = new Set();
// ["bar", "baz"].forEach(mySet.add);

// TypeError (strict mode and non-strict mode)- Cannot define property x, object is not extensible
// const obj = {};
// Object.preventExtensions(obj);
// Object.defineProperty(obj, "x", { value: "tuba" });

// "use strict";
// const objStrict = {};
// Object.preventExtensions(objStrict);
// objStrict.x = "tuba";

// TypeError (strict-mode only)- x is read-only
// "use strict";
// const obj = Object.freeze({ name: "Tuba", score: 666 });
// obj.score = 0; 

// TypeError (strict-mode only)- Cannot create property / Cannot assign to property 
// "use strict";
// const tuba = "not an object";
// tuba.horn = {};

// TypeError (strict-mode only)- Cannot delete property 
// "use strict";
// const arr = [];
// Object.defineProperty(arr, 0, { value: 0 });
// Object.defineProperty(arr, 1, { value: "1" });
// arr.length = 1;

// TypeError (strict-mode only)- "setting getter-only property" occurs when there is an attempt to set a new value to a property for which only a getter is specified.
// "use strict";

// function Archiver() {
//   const temperature = null;
//   Object.defineProperty(this, "temperature", {
//     get() {
//       console.log("get!");
//       return temperature;
//     },
//   });
// }

// const arc = new Archiver();
// arc.temperature; // 'get!'

// arc.temperature = 30;

// TypeError (strict-mode only)- caller, callee, and arguments properties may not be accessed on strict mode functions or the arguments objects for calls to them
// "use strict";

// function myFunc() {
//   if (myFunc.caller === null) {
//     return "The function was called from the top!";
//   } else {
//     return `This function's caller was ${myFunc.caller}`;
//   }
// }

// myFunc();

}

function rangeErrorTests() {
    // RangeError: BigInt division by zero
    // const a = 1n;
    // const b = 0n;
    // const quotient = a / b;

    // RangeError: BigInt negative exponent
    // const a = 1n;
    // const b = -1n;
    // const c = a ** b;

    // RangeError- big int conversion error
    let notInt = 'not a number';
    let int = BigInt(1/0);

    // RangeError: argument is not a valid code point
    // String.fromCodePoint(Infinity);

    // RangeError: invalid array length
    // let arr = new Array(-2);

    // RangeError: invalid date
    // const invalid = new Date("nothing");
    // invalid.toISOString();

    // RangeError: precision is out of range
    // (77.1234).toExponential(-1);
    // (2.34).toFixed(-100);
    // (1234.5).toPrecision(-1);

    // RangeError: radix must be an integer
    // (42).toString(0);

    // RangeError: repeat count must be less than infinity
    // "abc".repeat(Infinity);
    // "a".repeat(2 ** 30);

    // RangeError: repeat count must be non-negative
    // "abc".repeat(-1);

    // RangeError: x can't be converted to BigInt because it isn't an integer
    // const a = BigInt(1.5);


}

function referenceErrorTests() {
 // reference error- x is not defined
//   console.log(gobbledigook);
// const tubaNonFunc = document.getElementByID('tuba')

// reference error- strict-mode only, Assignment to undeclared variable
"use strict";
   function refStrictTest() {
     x = 7;
  }
  refStrictTest();

// reference error- lexical declaration before initialization
//   function lexicalTest() {
//     console.log(x);
//     let x = 7;
//   }
//   lexicalTest();

}

function uriErrorTests() {

// URIError- malformed URI sequence, URI encoding or decoding wasn't successful
encodeURI("\uD800");
// decodeURIComponent("%E0%A4%A");

}


module.exports = {
    syntaxErrorTests,
    typeErrorTests,
    rangeErrorTests,
    referenceErrorTests,
    uriErrorTests
}

