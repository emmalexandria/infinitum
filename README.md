<h3 align="center">Infinitum</h3>

<p align="center"><i>another typescript library for really big numbers</i></p>

--- 

**Short version:** This library implements a similar `Decimal` class to break_eternity. Install with:

```bash 
npm install infinitum
```


### Introduction

Infinitum follows in the footsteps of libraries like [break_infinity.js](https://github.com/Patashu/break_infinity.js) and [break_eternity.js](https://github.com/Patashu/break_eternity.js) by Patashu. These are libraries for very large number representation, particularly for incremental games. These libraries use a layered numerical representation, break_infinity using exponentiation, while break_eternity is based on [tetration](https://en.wikipedia.org/wiki/Tetration). 

Javascript's built-in `number` type is a 64-bit IEEE-754 floating point, which is good enough for most purposes, but caps out at about $`1.7e308`$ which on the scale of incremental games is quite small. Libraries like this use the mathematical concept of hyperoperation sequences. 

#### Hyperoperations for beginners 

[Hyperoperations](https://en.wikipedia.org/wiki/Hyperoperation) are a way of categorizing mathematical operations. The basic idea is that each operation in the sequence can be defined in terms of the previous happening $n$ times. We start the sequence at the successor operator $a+1$, then addition can be considered $n$ successor operations ($a+n$), multiplication is $n$ additions ($a \times n$), exponentiation is $n$ multiplications ($a^n$). 

