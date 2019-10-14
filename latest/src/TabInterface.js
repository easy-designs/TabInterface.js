/*------------------------------------------------------------------------------
Function:		TabInterface()
Author:			Aaron Gustafson (aaron at easy-designs dot net)
Creation Date:	7 December 2006
Version:		1.4
Homepage:		http://github.com/easy-designs/TabInterface.js
License:		MIT License (see MIT-LICENSE)
------------------------------------------------------------------------------*/
;function TabInterface( _cabinet, _i ){
	// Public Properties
	this.Version = '1.5'; // version
	
	// make sure we have a unique iterator if one wasn’t passed
	_i = _i || ( new Date() ).getTime();
	
	var
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
		var
		headers	= [ 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		tag		= false, 
		id, node, nextNode, i, len, rexp, arr, folder, folder_id, tab, tab_id, heading;

		// set the id
		id = _cabinet.getAttribute( 'id' ) || 'folder-' + _i;
		if ( !_cabinet.getAttribute( 'id' ) )
		{
			_cabinet.setAttribute( 'id', id );
		}

		// set the ARIA roles, tabindexes & base classes
		_index.setAttribute( 'role', 'tablist' );
		addClassName( _index, 'index' );
		_els.section.setAttribute( 'role', 'tabpanel' );
		_els.section.setAttribute( 'aria-hidden', 'true' );
		_els.section.setAttribute( 'tabindex', '-1' );
		addClassName( _els.section, 'folder' );
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
				tag = headers[i];
				break;
			}
		}

		if ( tag )
		{
			// flip it on
			addClassName( _cabinet, 'tabbed-on' );
			removeClassName( _cabinet, 'tabbed' );
			// establish the folders
			rexp = new RegExp( '<(' + tag + ')', 'ig' );
			arr	 = _cabinet.innerHTML.replace( rexp, "||||<$1" ).split( '||||' );
			arr.shift();
			_cabinet.innerHTML = '';
			// add the index
			_cabinet.appendChild( _index );
			// re-insert the chunks
			for ( i=0, len=arr.length; i<len; i++ )
			{
				// establish the ids
				folder_id	= id + '-' + i;
				tab_id		= id + '-' + i + '-tab';
				// build the section
				folder = _els.section.cloneNode( true );
				folder.setAttribute( 'id', folder_id );
				folder.setAttribute( 'aria-labelledby', tab_id );
				folder.innerHTML = arr[i];
				_cabinet.appendChild( folder );
				// build the tab
				tab = _els.li.cloneNode( true );
				tab.setAttribute( 'id', tab_id );
				tab.setAttribute( 'aria-controls', folder_id );
				tab.setAttribute( 'aria-describedby', folder_id );
				tab.onclick		= swap;		  // set the action
				tab.onfocus		= swap;
				tab.onkeydown	= moveFocus;  // add the keyboard control
				heading = folder.getElementsByTagName( tag )[0];
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
					_cabinet.setAttribute( 'aria-activedescendant', folder_id );
					folder.setAttribute( 'aria-hidden', 'false' );
					addClassName( folder, 'visible' );
					tab.setAttribute( 'aria-selected', 'true' );
					tab.setAttribute( 'tabindex', '0' );
					addClassName( tab, 'active' );
				}
			}
		}
	}
	function swap( e )
	{
		e = ( e ) ? e : event;
		var
		active_id	= _cabinet.getAttribute( 'aria-activedescendant' ),
		old_panel	= document.getElementById( active_id ),
		old_tab 	= document.getElementById( active_id + '-tab' ),
		new_tab		= getTab( e.target || e.srcElement ),
		new_panel	= document.getElementById( new_tab.getAttribute( 'aria-controls' ) );
		// disable old tab & tabpanel
		removeClassName( old_tab, 'active' );
		old_tab.setAttribute( 'aria-selected', 'false' );
		old_tab.setAttribute( 'tabindex', '-1' );
		removeClassName( old_panel, 'visible' );
		old_panel.setAttribute( 'aria-hidden', 'true' );
		// activate the new tab & tabpanel
		addClassName( new_tab, 'active' );
		new_tab.setAttribute( 'aria-selected', 'true' );
		new_tab.setAttribute( 'tabindex', '0' );
		addClassName( new_panel, 'visible' );
		new_panel.setAttribute( 'aria-hidden', 'false' );
		// update the interface
		_cabinet.setAttribute( 'aria-activedescendant', new_panel.getAttribute( 'id' ) );
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
		tab	 = getTab( e.target || e.srcElement ),
		key	 = e.keyCode || e.charCode,
		pass = true;
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
				tab.parentNode.firstChild.focus();
			}
			else
			{
				tab.parentNode.lastChild.focus();
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
					tab.parentNode.firstChild.focus();
				}
				else
				{
					tab.parentNode.lastChild.focus();
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