/*------------------------------------------------------------------------------
Function:		TabInterface()
Author:			Aaron Gustafson (aaron at easy-designs dot net)
Creation Date:	7 December 2006
Version:		1.3
Homepage:		http://github.com/easy-designs/TabInterface.js
License:		MIT License (see MIT-LICENSE)
------------------------------------------------------------------------------*/
function TabInterface( _cabinet, _i ){
	// Public Properties
	this.Version = '1.3'; // version

	// Private Properties
	var
	_active	= false, // ID of the active "folder"
	// the tab list
	_index	= document.createElement( 'ul' ),
	// prototype elements
	_els	= {
		section:	document.createElement( 'section' ),
		li:			document.createElement( 'li' )
	};

	// Private Methods
	function initialize()
	{
		var _id, node, nextNode,
		headers = [ 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		i, len, _tag, rexp,
		arr, folder, tab, heading;

		// set the id
		_id = _cabinet.getAttribute( 'id' ) || 'folder-' + _i;
		if ( !_cabinet.getAttribute( 'id' ) )
		{
			_cabinet.setAttribute( 'id', _id );
		}

		// set the ARIA roles
		_cabinet.setAttribute( 'role', 'application' );
		_index.setAttribute( 'role', 'tablist' );
		_els.section.setAttribute( 'role', 'tabpanel' );
		_els.section.setAttribute( 'aria-hidden', 'true' );
		_els.section.setAttribute( 'tabindex', '-1' );
		_els.li.setAttribute( 'role', 'tab' );
		_els.li.setAttribute( 'aria-selected', 'false' );
		_els.li.setAttribute( 'tabindex', '-1' );

		// trim whitespace
		node = _cabinet.firstChild;
		while ( node )
		{
			nextNode = node.nextSibling;
			if( node.nodeType == 3 &&
				!( /\S/ ).test( node.nodeValue ) )
			{
				_cabinet.removeChild( node );
			}
			node = nextNode;
		}

		// find the first heading
		for ( i=0, len=headers.length; i<len; i++ )
		{
			if ( _cabinet.firstChild.nodeName.toLowerCase() == headers[i] )
			{
				_tag = headers[i];
				break;
			}
		}

		// flip it on
		addClassName( _cabinet, 'tabbed-on' );
		removeClassName( _cabinet, 'tabbed' );
		// establish the folders
		rexp = new RegExp( '<(' + _tag + ')', 'ig' );
		arr	 = _cabinet.innerHTML.replace( rexp, "||||<$1" ).split( '||||' );
		arr.shift();
		_cabinet.innerHTML = '';
		// add the index
		addClassName( _index, 'index' );
		_cabinet.appendChild( _index );
		// re-insert the chunks
		for ( i=0, len=arr.length; i<len; i++ )
		{
			// build the section
			folder = _els.section.cloneNode( true );
			addClassName( folder, 'folder' );
			folder.setAttribute( 'id', _id + '-' + i );
			folder.setAttribute( 'aria-labelledby', _id + '-' + i + '-tab' );
			folder.innerHTML = arr[i];
			_cabinet.appendChild( folder );
			// build the tab
			tab = _els.li.cloneNode( true );
			tab.setAttribute( 'id', _id + '-' + i + '-tab' );
			tab.setAttribute( 'aria-controls', _id + '-' + i );
			tab.setAttribute( 'aria-describedby', _id + '-' + i );
			tab.onclick = swap;		  // set the action
			tab.onkeydown = moveFocus;  // add the keyboard control
			tab.onfocus = swap;
			heading = folder.getElementsByTagName( _tag )[0];
			if ( heading.getAttribute( 'title' ) )
			{
				tab.innerHTML = heading.getAttribute( 'title' );
			}
			else
			{
				tab.innerHTML = heading.innerHTML;
				addClassName( heading, 'hidden' );
			}
			_index.appendChild( tab );
			// active?
			if ( i === 0 )
			{
				addClassName( folder, 'visible' );
				folder.setAttribute( 'aria-hidden', 'false' );
				tab.setAttribute( 'aria-selected', 'true' );
				tab.setAttribute( 'tabindex', '0' );
				_active = folder.getAttribute( 'id' );
				_cabinet.setAttribute('aria-activedescendant',_active);
				addClassName( tab, 'active' );
			}
		}
	}
	function swap( e )
	{
		e = ( e ) ? e : event;
		var
		tab = e.target || e.srcElement,
		old_folder = document.getElementById( _active ),
		old_tab = document.getElementById( _active + '-tab' ),
		new_folder;
		tab = getTab( tab );
		new_folder = document.getElementById( tab.getAttribute( 'id' ).replace( '-tab', '' ) );
		removeClassName( old_tab, 'active' );
		old_tab.setAttribute( 'aria-selected', 'false' );
		old_tab.setAttribute( 'tabindex', '-1' );
		removeClassName( old_folder, 'visible' );
		old_folder.setAttribute( 'aria-hidden', 'true' );
		addClassName( tab, 'active' );
		tab.setAttribute( 'aria-selected', 'true' );
		tab.setAttribute( 'tabindex', '0' );
		addClassName( new_folder, 'visible' );
		new_folder.setAttribute( 'aria-hidden', 'false' );
		_active = new_folder.getAttribute( 'id' );
		_cabinet.setAttribute( 'aria-activedescendant', _active );
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
		for ( var i=classes.length-1; i>=0; i-- )
		{
			if( classes[i] == c ) classes.splice( i, 1 );
		}
		e.className = classes.join( ' ' );
	}
	function getTab( tab )
	{
		while ( tab.nodeName.toLowerCase() != 'li' )
		{
			tab = tab.parentNode;
		}
		return tab;
	}
	function moveFocus( e )
	{
		e = ( e ) ? e : event;
		var
		tab	 = e.target || e.srcElement,
		key	 = e.keyCode || e.charCode,
		pass = true;
		tab = getTab( tab );
		switch ( key )
		{
			case 13: // enter
				document.getElementById( _active ).focus();
				pass = false;
				break;	  
			case 37: // left arrow
			case 38: // up arrow
				move( tab, 'previous', false );
				pass = false;
				break;
			case 39: // right arrow
			case 40: // down arrow
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
			// wrap
			else
			{
				if ( direction == 'next' )
				{
					tab.parentNode.childNodes[0].focus();
				}
				else
				{
					tab.parentNode.childNodes[tab.parentNode.childNodes.length-1].focus();
				}
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