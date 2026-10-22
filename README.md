<h3 align="center">Infinitum</h3>

<p align="center"><i>another typescript library for really big numbers</i></p>

--- 

Infinitum follows in the footsteps of libraries like [break_infinity.js](https://github.com/Patashu/break_infinity.js) and [break_eternity.js](https://github.com/Patashu/break_eternity.js) by Patashu. These are libraries for very large number representation, particularly for incremental games. These libraries use a layered numerical representation based on [tetration](https://en.wikipedia.org/wiki/Tetration). 

Javascript's built-in `number` type is a 64-bit IEEE-754 floating point, which is good enough for most purposes, but caps out at about $`1.7e308`$

