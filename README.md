<h3 align="center">Infinitum</h3>

<p align="center"><i>another typescript library for really big numbers</i></p>

--- 

**Short version:** This library implements a similar `Decimal` class to `break_{infinity,eternity}.js`. Install with:

```bash 
npm install infinitum
```

Infinitum follows in the footsteps of libraries like [break_infinity.js](https://github.com/Patashu/break_infinity.js) and [break_eternity.js](https://github.com/Patashu/break_eternity.js) by Patashu. Javascript's built-in `number` type is a 64-bit IEEE-754 floating point, which is good enough for most purposes, but caps out at about $`1.7e308`$. On the scale of incremental games, this is uselessly small! To overcome this, libraries like `break_eternity.js` use the concept of hyperoperations. 

### Hyperoperations for beginners 

[Hyperoperations](https://en.wikipedia.org/wiki/Hyperoperation) are a way of categorizing mathematical operations. The idea is that each operation in the sequence can be defined in terms of the previous happening $n$ times. We start the sequence at (0) the successor operator $a+1$. (1) Addition can be considered $n$ successor operations ($a+n$), (2) multiplication is $n$ additions ($a \times n$), and finally (3) exponentiation is $n$ multiplications ($a^n$). Tetration and pentation are the two next operations in this sequence, but we almost never use them because the numbers they result in are usually impractically large and useless for most real mathematics. The same intuition holds for these two operators, but we have some new notation introduced by Donald Knuth, where $a \uparrow\uparrow 4$ would be $a^{a^{a^a}} = 65536$. Pentation is represented with $a \uparrow\uparrow\uparrow n$ and so on. I'm sure you can see why we use special notation. 

This is the mathematics libraries like `break_infinity.js` use for their number representations. 
