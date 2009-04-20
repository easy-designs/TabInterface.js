/*------------------------------------------------------------------------------
Function:       TabInterface()
Author:         Aaron Gustafson (aaron at easy-designs dot net)
Creation Date:  7 December 2006
Version:        0.4
Homepage:       http://github.com/easy-designs/tabinterface.js
License:        MIT License (see MIT-LICENSE)
Note:           If you change or improve on this script, please let us know by
                emailing the author (above) with a link to your demo page.
------------------------------------------------------------------------------*/
function TabInterface( el, i ){
  // Public Properties
  this.Version = '0.4'; // version

  // Private Properties
  var _i       = i;     // incrementor
  var _cabinet = el;    // the "cabinet" element (container)
  var _id      = false; // ID of _cabinet
  var _active  = false; // ID of the active "folder"
  var _tag     = false; // tag we'll split it on
  // the tab list
  var _index   = document.createElement( 'ul' );
  // prototype elements
  var _els     = {
    div: document.createElement( 'div' ),
    li:  document.createElement( 'li' )
  };

  // Private Methods
  function initialize()
  {
    // set the id
    _id = el.getAttribute( 'id' ) || 'folder-' + _i;
    if( !el.getAttribute( 'id' ) ) el.setAttribute( 'id', _id );
    
    // set the ARIA roles
    el.parentNode.setAttribute( 'role', 'application' );
    el.setAttribute( 'role', 'presentation' );
    _index.setAttribute( 'role', 'tablist' );
    _els.div.setAttribute( 'role', 'tabpanel' );
    _els.div.setAttribute( 'aria-hidden', 'true' );
    _els.li.setAttribute( 'role', 'tab' );
    _els.li.setAttribute( 'aria-selected', 'false' );
    _els.li.setAttribute( 'tabindex', '-1' );

    // trim whitespace
    var node = _cabinet.firstChild;
    while( node ){
      var nextNode = node.nextSibling;
      if( node.nodeType == 3 &&
          !( /\S/ ).test( node.nodeValue ) )
        _cabinet.removeChild( node );
      node = nextNode;
    }

    // find the first heading
    var headers = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
    var hLen = headers.length;
    for( var i=0; i<hLen; i++ ){
      if( _cabinet.firstChild.nodeName.toLowerCase() == headers[i] ){
        _tag = headers[i];
        break;
      }
    }

    // establish the folders
    var rexp = new RegExp( '<(' + _tag + ')', 'ig' );
    var arr  = _cabinet.innerHTML.replace( rexp, "||||<$1" ).split( '||||' );
        arr.shift();
    _cabinet.innerHTML = '';
    removeClassName( _cabinet, 'tabbed' );
    addClassName( _cabinet, 'tabbed-on' );
    var aLen = arr.length;
    for( var k=0; k<aLen; k++ ){
      // build the div
      var folder = _els.div.cloneNode( true );
          addClassName( folder, 'folder' );
          folder.setAttribute( 'id', _id + '-' + k );
          folder.setAttribute( 'aria-labelledby', _id + '-' + k + '-tab' );
          folder.innerHTML = arr[k];
          _cabinet.appendChild( folder );
      // build the tab
      var tab = _els.li.cloneNode( true );
          tab.folder = folder.getAttribute( 'id' );
          tab.setAttribute( 'id', tab.folder + '-tab' );
          tab.onclick = swap;         // set the action
          tab.onkeypress = moveFocus; // add the keyboard control
      var heading = folder.getElementsByTagName( _tag )[0];
          if( heading.getAttribute( 'title' ) ){
            tab.innerHTML = heading.getAttribute( 'title' );
          } else {
            tab.innerHTML = heading.innerHTML;
            addClassName( heading, 'hidden' );
          }
          _index.appendChild( tab );
      // active?
      if( k == 0 ){
        addClassName( folder, 'visible' );
        folder.setAttribute( 'aria-hidden', 'false' );
        tab.setAttribute( 'aria-selected', 'true' );
        tab.setAttribute( 'tabindex', '0' );
        _active = folder.getAttribute( 'id' );
        addClassName( tab, 'active-tab' );
      }
    }
    // add the index
    addClassName( _index, 'tab-list' );
    _cabinet.appendChild( _index );
  }
  function swap( e )
  {
    e = ( e ) ? e : event;
    var tab = e.target || e.srcElement,
    old_folder = document.getElementById( _active ),
    new_folder = document.getElementById( tab.folder );
    removeClassName( document.getElementById( _active + '-tab' ), 'active-tab' );
    removeClassName( old_folder, 'visible' );
    old_folder.setAttribute( 'aria-hidden', 'true' );
    addClassName( tab, 'active-tab' );
    addClassName( new_folder, 'visible' );
    new_folder.setAttribute( 'aria-hidden', 'false' );
    _active = tab.folder;
  }
  function addClassName( e, c )
  {
    var classes = ( !e.className ) ? [] : e.className.split( ' ' );
    classes.push( c );
    e.className = classes.join( ' ' );
  }
  function removeClassName( e, c )
  {
    var classes = e.className.split( ' ' );
    for( var i=classes.length-1; i>=0; i-- ){
      if( classes[i] == c ) classes.splice( i, 1 );
    }
    e.className = classes.join( ' ' );
  }
  function moveFocus( e )
  {
    e = ( e ) ? e : event;
    var
    tab  = e.target || e.srcElement,
    key  = e.keyCode || e.charCode,
    pass = true;
    switch ( key )
    {
      case 37: // left arrow
      case 40: // down arrow
        move( tab, 'previous', false );
        pass = false;
        break;
      case 39: // right arrow
      case 38: // up arrow
        move( tab, 'next', false );
        pass = false;
        break;
      case 36: // home
        move( tab, 'previous', true );
        pass = false;
        break;    
      case 35: // end
        move( tab, 'next', true );
        pass = false;
        break;    
      case 27: // escape
        tab.blur();
        pass = false;
        break;
      case 13: // enter
      case 32: // space
        swap( e );
        pass = false;
        break;
      default:
        pass = true;
        break;
    }
    if ( ! pass )
    {
      return cancel( e );
    }
  }
  function move( tab, direction, complete )
  {
    if ( complete )
    {
      if ( direction == 'previous' )
      {
        tab.parentNode.childNodes[0].focus();
      }
      else
      {
        tab.parentNode.childNodes[tab.parentNode.childNodes.length-1].focus();
      }
    }
    else
    {
      var target = direction == 'previous' ? tab.previousSibling
                                           : tab.nextSibling;
      if ( target )
      {
        target.focus();
      }
    }
  }
  function cancel( e )
  {
    if ( typeof e.stopPropagation == "function" )
    {
      e.stopPropagation();
    }
    else if ( typeof e.cancelBubble != "undefined" )
    {
      e.cancelBubble = true;
    }
    if ( e.preventDefault )
    {
      e.preventDefault();
    }
    return false;
  }

  // start it up
  initialize();
};