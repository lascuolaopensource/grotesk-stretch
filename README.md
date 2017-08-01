## Grotesk Stretch

An experiment to create tools that make use of the "stretching" abilities of the SOS font. 
The stretched letter is obtained by the interpolation of two glyphs rather than stretching all the points linearly.

## sound.html
aka Making letters dance with your mic. This sketch divides the sound spectrum into bins that correspond to each row of text. Values are further divided for every letter of the row and its average is assigned to each letter.

This file currently contains the best implementation of the letter.

## index.html
A stretching composer. The longer you press the more you stretch!


## Usage
You must run this on a web server. Quickest way to achieve this on macOS is to use the built in Python server.

## TODO
- Add curves to the displayed characters as per the .glif file. All curves are quadratic beziers
- Add more glyphs
- General clean up and optimization


## Thanks
Built in one day at [SOS](http://www.lascuolaopensource.xyz) in Bari. Thanks to Daniele Capo and all the other great people at SOS for making this happen.

Bari – July, 2017