1.0.1 :
----------------
- You can show/hide header/columns
- Format columns/rows as you consider. (Breaking lines can be done by using '\n', '\r', '\r\n' in your texts, or by returning an array of strings [ string1, string2, ... , stringN])
- WrapWrap texts
- Flip table to the left
- Read the example below for usage and additional information. 'exampleConfig' contains global and user options.

2.0.0 :
----------------
- As of 2.0 this package has been rewritten to use Promises.
- These 3 promises are all there is to it: getFreePorts, isFreePort, nextAvailable .
- Let {getFreePorts, isFreePort, nextAvailable} = require('node-port-check');
- Read the examples below to see how to use them.

