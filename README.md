callback-timer
===============

```js
var wrap = require("callback-timer").wrap;

var myWrappedCallback = wrap(
  {
    tag: "myModule",
    methodName: "myAsynchronousCall",
    maxTimeWarning: 500,
  },
  myOriginalCallback,
);

//output timing info to console.warn when myAsynchronousCall takes over 500 ms
myModule.myAsynchronousCall(myWrappedCallback);
//[myModule] Call (myAsynchronousCall) took longer than 0.5 seconds - 0.671 seconds
```

`wrap ( config, callback )`: Function

Wrap a callback function to add timing and logging asyncronous calls

Parameters:

- `config`: Object
  - Configuration for the logging and callback
    - `context`: Object
      - Context to run the callback function in
      - default: null
    - `logger`: Object
      - Logging utility with a warn method
      - default: console
    - `maxTimeWarning`: Number
      - Time in ms to determine if a call is too slow. Will not log if call is faster. Will always log if 0.
      - default: 0
    - `tag`: Array | String
      - Value to show in [] before log message.
      - default ''
    - `methodName`: String
      - Name of the method to display in the log
      - default: ''
    - `useRelativeTime`: Boolean
      - Display the time in (X minutes Y seconds) or (X.YYY) seconds.
      - Default: true
  - `callback`: Function
    - Function to wrap

Returns: Function

- Wrapped Callback

Note, this will not properly time functions that return a Promise, or have other async behavior. :(
