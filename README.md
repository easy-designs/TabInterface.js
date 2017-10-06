# TabInterface

TabInterface generates all of the code necessary to create an accessible tabbed interface in JavaScript.

## Current Version

* 1.3 (5 April 2011)

## Requirements

None.

## Use

To use, simply include TabInterface.js (found in ./min) and then classify elements you want tabbed as "tabbed". Then add a new anonymous function to your load event (`window` or DOM). For example:

## Demo

A demo is included in the ./demo directory.

```javascript
if( typeOf( TabInterface ) != 'undefined' &&
    document.getElementById &&
    document.getElementsByTagName &&
    document.createElement ){
  var cabinets = Array();
  /* using Jesse Skinner's addDOMLoadEvent()
     http://www.thefutureoftheweb.com/blog/adddomloadevent */
  addDOMLoadEvent( function(){
    var collection = document.getElementsByTagName( '*' );
    var cLen = collection.length;
    for( var i=0; i<cLen; i++ ){
      if( collection[i] &&
          /\s*tabbed\s*/.test( collection[i].className ) ){
        cabinets.push( new TabInterface( collection[i], i ) );
      }
    }
  } );
}
```
Many libraries, such as Prototype and jQuery, offer nicer-looking means of collecting elements by CLASS and and those could certainly be substituted for the brute force testing seen above.

Note: Tab labels will be either the header content or the heading's TITLE value.

## How it works

Content is split using the first heading level (H1-H6) or HEADING element encountered within the "tabbed" container.

## Changelog
[Changelog](CHANGELOG.md)

## License

TabInterface is distributed under the liberal MIT License
