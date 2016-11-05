/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	__webpack_require__(1);

	__webpack_require__(4);

	__webpack_require__(6);

	var _project = __webpack_require__(9);

	var _project2 = _interopRequireDefault(_project);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	$(function () {
	  var _window$project = window.project,
	      directory = _window$project.directory,
	      name = _window$project.name,
	      clientUUID = _window$project.clientUUID;

	  var project = new _project2.default(directory, name, clientUUID);
	  project.listen();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery UI Widget 1.12.1
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */

	//>>label: Widget
	//>>group: Core
	//>>description: Provides a factory for creating stateful widgets with a common API.
	//>>docs: http://api.jqueryui.com/jQuery.widget/
	//>>demos: http://jqueryui.com/widget/

	( function( factory ) {
		if ( true ) {

			// AMD. Register as an anonymous module.
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(2), __webpack_require__(3) ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {

			// Browser globals
			factory( jQuery );
		}
	}( function( $ ) {

	var widgetUuid = 0;
	var widgetSlice = Array.prototype.slice;

	$.cleanData = ( function( orig ) {
		return function( elems ) {
			var events, elem, i;
			for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
				try {

					// Only trigger remove when necessary to save time
					events = $._data( elem, "events" );
					if ( events && events.remove ) {
						$( elem ).triggerHandler( "remove" );
					}

				// Http://bugs.jquery.com/ticket/8235
				} catch ( e ) {}
			}
			orig( elems );
		};
	} )( $.cleanData );

	$.widget = function( name, base, prototype ) {
		var existingConstructor, constructor, basePrototype;

		// ProxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		var proxiedPrototype = {};

		var namespace = name.split( "." )[ 0 ];
		name = name.split( "." )[ 1 ];
		var fullName = namespace + "-" + name;

		if ( !prototype ) {
			prototype = base;
			base = $.Widget;
		}

		if ( $.isArray( prototype ) ) {
			prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
		}

		// Create selector for plugin
		$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
			return !!$.data( elem, fullName );
		};

		$[ namespace ] = $[ namespace ] || {};
		existingConstructor = $[ namespace ][ name ];
		constructor = $[ namespace ][ name ] = function( options, element ) {

			// Allow instantiation without "new" keyword
			if ( !this._createWidget ) {
				return new constructor( options, element );
			}

			// Allow instantiation without initializing for simple inheritance
			// must use "new" keyword (the code above always passes args)
			if ( arguments.length ) {
				this._createWidget( options, element );
			}
		};

		// Extend with the existing constructor to carry over any static properties
		$.extend( constructor, existingConstructor, {
			version: prototype.version,

			// Copy the object used to create the prototype in case we need to
			// redefine the widget later
			_proto: $.extend( {}, prototype ),

			// Track widgets that inherit from this widget in case this widget is
			// redefined after a widget inherits from it
			_childConstructors: []
		} );

		basePrototype = new base();

		// We need to make the options hash a property directly on the new instance
		// otherwise we'll modify the options hash on the prototype that we're
		// inheriting from
		basePrototype.options = $.widget.extend( {}, basePrototype.options );
		$.each( prototype, function( prop, value ) {
			if ( !$.isFunction( value ) ) {
				proxiedPrototype[ prop ] = value;
				return;
			}
			proxiedPrototype[ prop ] = ( function() {
				function _super() {
					return base.prototype[ prop ].apply( this, arguments );
				}

				function _superApply( args ) {
					return base.prototype[ prop ].apply( this, args );
				}

				return function() {
					var __super = this._super;
					var __superApply = this._superApply;
					var returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			} )();
		} );
		constructor.prototype = $.widget.extend( basePrototype, {

			// TODO: remove support for widgetEventPrefix
			// always use the name + a colon as the prefix, e.g., draggable:start
			// don't prefix for widgets that aren't DOM-based
			widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
		}, proxiedPrototype, {
			constructor: constructor,
			namespace: namespace,
			widgetName: name,
			widgetFullName: fullName
		} );

		// If this widget is being redefined then we need to find all widgets that
		// are inheriting from it and redefine all of them so that they inherit from
		// the new version of this widget. We're essentially trying to replace one
		// level in the prototype chain.
		if ( existingConstructor ) {
			$.each( existingConstructor._childConstructors, function( i, child ) {
				var childPrototype = child.prototype;

				// Redefine the child widget using the same prototype that was
				// originally used, but inherit from the new version of the base
				$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
					child._proto );
			} );

			// Remove the list of existing child constructors from the old constructor
			// so the old child constructors can be garbage collected
			delete existingConstructor._childConstructors;
		} else {
			base._childConstructors.push( constructor );
		}

		$.widget.bridge( name, constructor );

		return constructor;
	};

	$.widget.extend = function( target ) {
		var input = widgetSlice.call( arguments, 1 );
		var inputIndex = 0;
		var inputLength = input.length;
		var key;
		var value;

		for ( ; inputIndex < inputLength; inputIndex++ ) {
			for ( key in input[ inputIndex ] ) {
				value = input[ inputIndex ][ key ];
				if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

					// Clone objects
					if ( $.isPlainObject( value ) ) {
						target[ key ] = $.isPlainObject( target[ key ] ) ?
							$.widget.extend( {}, target[ key ], value ) :

							// Don't extend strings, arrays, etc. with objects
							$.widget.extend( {}, value );

					// Copy everything else by reference
					} else {
						target[ key ] = value;
					}
				}
			}
		}
		return target;
	};

	$.widget.bridge = function( name, object ) {
		var fullName = object.prototype.widgetFullName || name;
		$.fn[ name ] = function( options ) {
			var isMethodCall = typeof options === "string";
			var args = widgetSlice.call( arguments, 1 );
			var returnValue = this;

			if ( isMethodCall ) {

				// If this is an empty collection, we need to have the instance method
				// return undefined instead of the jQuery instance
				if ( !this.length && options === "instance" ) {
					returnValue = undefined;
				} else {
					this.each( function() {
						var methodValue;
						var instance = $.data( this, fullName );

						if ( options === "instance" ) {
							returnValue = instance;
							return false;
						}

						if ( !instance ) {
							return $.error( "cannot call methods on " + name +
								" prior to initialization; " +
								"attempted to call method '" + options + "'" );
						}

						if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
							return $.error( "no such method '" + options + "' for " + name +
								" widget instance" );
						}

						methodValue = instance[ options ].apply( instance, args );

						if ( methodValue !== instance && methodValue !== undefined ) {
							returnValue = methodValue && methodValue.jquery ?
								returnValue.pushStack( methodValue.get() ) :
								methodValue;
							return false;
						}
					} );
				}
			} else {

				// Allow multiple hashes to be passed on init
				if ( args.length ) {
					options = $.widget.extend.apply( null, [ options ].concat( args ) );
				}

				this.each( function() {
					var instance = $.data( this, fullName );
					if ( instance ) {
						instance.option( options || {} );
						if ( instance._init ) {
							instance._init();
						}
					} else {
						$.data( this, fullName, new object( options, this ) );
					}
				} );
			}

			return returnValue;
		};
	};

	$.Widget = function( /* options, element */ ) {};
	$.Widget._childConstructors = [];

	$.Widget.prototype = {
		widgetName: "widget",
		widgetEventPrefix: "",
		defaultElement: "<div>",

		options: {
			classes: {},
			disabled: false,

			// Callbacks
			create: null
		},

		_createWidget: function( options, element ) {
			element = $( element || this.defaultElement || this )[ 0 ];
			this.element = $( element );
			this.uuid = widgetUuid++;
			this.eventNamespace = "." + this.widgetName + this.uuid;

			this.bindings = $();
			this.hoverable = $();
			this.focusable = $();
			this.classesElementLookup = {};

			if ( element !== this ) {
				$.data( element, this.widgetFullName, this );
				this._on( true, this.element, {
					remove: function( event ) {
						if ( event.target === element ) {
							this.destroy();
						}
					}
				} );
				this.document = $( element.style ?

					// Element within the document
					element.ownerDocument :

					// Element is window or document
					element.document || element );
				this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
			}

			this.options = $.widget.extend( {},
				this.options,
				this._getCreateOptions(),
				options );

			this._create();

			if ( this.options.disabled ) {
				this._setOptionDisabled( this.options.disabled );
			}

			this._trigger( "create", null, this._getCreateEventData() );
			this._init();
		},

		_getCreateOptions: function() {
			return {};
		},

		_getCreateEventData: $.noop,

		_create: $.noop,

		_init: $.noop,

		destroy: function() {
			var that = this;

			this._destroy();
			$.each( this.classesElementLookup, function( key, value ) {
				that._removeClass( value, key );
			} );

			// We can probably remove the unbind calls in 2.0
			// all event bindings should go through this._on()
			this.element
				.off( this.eventNamespace )
				.removeData( this.widgetFullName );
			this.widget()
				.off( this.eventNamespace )
				.removeAttr( "aria-disabled" );

			// Clean up events and states
			this.bindings.off( this.eventNamespace );
		},

		_destroy: $.noop,

		widget: function() {
			return this.element;
		},

		option: function( key, value ) {
			var options = key;
			var parts;
			var curOption;
			var i;

			if ( arguments.length === 0 ) {

				// Don't return a reference to the internal hash
				return $.widget.extend( {}, this.options );
			}

			if ( typeof key === "string" ) {

				// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
				options = {};
				parts = key.split( "." );
				key = parts.shift();
				if ( parts.length ) {
					curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
					for ( i = 0; i < parts.length - 1; i++ ) {
						curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
						curOption = curOption[ parts[ i ] ];
					}
					key = parts.pop();
					if ( arguments.length === 1 ) {
						return curOption[ key ] === undefined ? null : curOption[ key ];
					}
					curOption[ key ] = value;
				} else {
					if ( arguments.length === 1 ) {
						return this.options[ key ] === undefined ? null : this.options[ key ];
					}
					options[ key ] = value;
				}
			}

			this._setOptions( options );

			return this;
		},

		_setOptions: function( options ) {
			var key;

			for ( key in options ) {
				this._setOption( key, options[ key ] );
			}

			return this;
		},

		_setOption: function( key, value ) {
			if ( key === "classes" ) {
				this._setOptionClasses( value );
			}

			this.options[ key ] = value;

			if ( key === "disabled" ) {
				this._setOptionDisabled( value );
			}

			return this;
		},

		_setOptionClasses: function( value ) {
			var classKey, elements, currentElements;

			for ( classKey in value ) {
				currentElements = this.classesElementLookup[ classKey ];
				if ( value[ classKey ] === this.options.classes[ classKey ] ||
						!currentElements ||
						!currentElements.length ) {
					continue;
				}

				// We are doing this to create a new jQuery object because the _removeClass() call
				// on the next line is going to destroy the reference to the current elements being
				// tracked. We need to save a copy of this collection so that we can add the new classes
				// below.
				elements = $( currentElements.get() );
				this._removeClass( currentElements, classKey );

				// We don't use _addClass() here, because that uses this.options.classes
				// for generating the string of classes. We want to use the value passed in from
				// _setOption(), this is the new value of the classes option which was passed to
				// _setOption(). We pass this value directly to _classes().
				elements.addClass( this._classes( {
					element: elements,
					keys: classKey,
					classes: value,
					add: true
				} ) );
			}
		},

		_setOptionDisabled: function( value ) {
			this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this._removeClass( this.hoverable, null, "ui-state-hover" );
				this._removeClass( this.focusable, null, "ui-state-focus" );
			}
		},

		enable: function() {
			return this._setOptions( { disabled: false } );
		},

		disable: function() {
			return this._setOptions( { disabled: true } );
		},

		_classes: function( options ) {
			var full = [];
			var that = this;

			options = $.extend( {
				element: this.element,
				classes: this.options.classes || {}
			}, options );

			function processClassString( classes, checkOption ) {
				var current, i;
				for ( i = 0; i < classes.length; i++ ) {
					current = that.classesElementLookup[ classes[ i ] ] || $();
					if ( options.add ) {
						current = $( $.unique( current.get().concat( options.element.get() ) ) );
					} else {
						current = $( current.not( options.element ).get() );
					}
					that.classesElementLookup[ classes[ i ] ] = current;
					full.push( classes[ i ] );
					if ( checkOption && options.classes[ classes[ i ] ] ) {
						full.push( options.classes[ classes[ i ] ] );
					}
				}
			}

			this._on( options.element, {
				"remove": "_untrackClassesElement"
			} );

			if ( options.keys ) {
				processClassString( options.keys.match( /\S+/g ) || [], true );
			}
			if ( options.extra ) {
				processClassString( options.extra.match( /\S+/g ) || [] );
			}

			return full.join( " " );
		},

		_untrackClassesElement: function( event ) {
			var that = this;
			$.each( that.classesElementLookup, function( key, value ) {
				if ( $.inArray( event.target, value ) !== -1 ) {
					that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
				}
			} );
		},

		_removeClass: function( element, keys, extra ) {
			return this._toggleClass( element, keys, extra, false );
		},

		_addClass: function( element, keys, extra ) {
			return this._toggleClass( element, keys, extra, true );
		},

		_toggleClass: function( element, keys, extra, add ) {
			add = ( typeof add === "boolean" ) ? add : extra;
			var shift = ( typeof element === "string" || element === null ),
				options = {
					extra: shift ? keys : extra,
					keys: shift ? element : keys,
					element: shift ? this.element : element,
					add: add
				};
			options.element.toggleClass( this._classes( options ), add );
			return this;
		},

		_on: function( suppressDisabledCheck, element, handlers ) {
			var delegateElement;
			var instance = this;

			// No suppressDisabledCheck flag, shuffle arguments
			if ( typeof suppressDisabledCheck !== "boolean" ) {
				handlers = element;
				element = suppressDisabledCheck;
				suppressDisabledCheck = false;
			}

			// No element argument, shuffle and use this.element
			if ( !handlers ) {
				handlers = element;
				element = this.element;
				delegateElement = this.widget();
			} else {
				element = delegateElement = $( element );
				this.bindings = this.bindings.add( element );
			}

			$.each( handlers, function( event, handler ) {
				function handlerProxy() {

					// Allow widgets to customize the disabled handling
					// - disabled as an array instead of boolean
					// - disabled class as method for disabling individual parts
					if ( !suppressDisabledCheck &&
							( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
						return;
					}
					return ( typeof handler === "string" ? instance[ handler ] : handler )
						.apply( instance, arguments );
				}

				// Copy the guid so direct unbinding works
				if ( typeof handler !== "string" ) {
					handlerProxy.guid = handler.guid =
						handler.guid || handlerProxy.guid || $.guid++;
				}

				var match = event.match( /^([\w:-]*)\s*(.*)$/ );
				var eventName = match[ 1 ] + instance.eventNamespace;
				var selector = match[ 2 ];

				if ( selector ) {
					delegateElement.on( eventName, selector, handlerProxy );
				} else {
					element.on( eventName, handlerProxy );
				}
			} );
		},

		_off: function( element, eventName ) {
			eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
				this.eventNamespace;
			element.off( eventName ).off( eventName );

			// Clear the stack to avoid memory leaks (#10056)
			this.bindings = $( this.bindings.not( element ).get() );
			this.focusable = $( this.focusable.not( element ).get() );
			this.hoverable = $( this.hoverable.not( element ).get() );
		},

		_delay: function( handler, delay ) {
			function handlerProxy() {
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}
			var instance = this;
			return setTimeout( handlerProxy, delay || 0 );
		},

		_hoverable: function( element ) {
			this.hoverable = this.hoverable.add( element );
			this._on( element, {
				mouseenter: function( event ) {
					this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
				},
				mouseleave: function( event ) {
					this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
				}
			} );
		},

		_focusable: function( element ) {
			this.focusable = this.focusable.add( element );
			this._on( element, {
				focusin: function( event ) {
					this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
				},
				focusout: function( event ) {
					this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
				}
			} );
		},

		_trigger: function( type, event, data ) {
			var prop, orig;
			var callback = this.options[ type ];

			data = data || {};
			event = $.Event( event );
			event.type = ( type === this.widgetEventPrefix ?
				type :
				this.widgetEventPrefix + type ).toLowerCase();

			// The original event may come from any element
			// so we need to reset the target on the new event
			event.target = this.element[ 0 ];

			// Copy original event properties over to the new event
			orig = event.originalEvent;
			if ( orig ) {
				for ( prop in orig ) {
					if ( !( prop in event ) ) {
						event[ prop ] = orig[ prop ];
					}
				}
			}

			this.element.trigger( event, data );
			return !( $.isFunction( callback ) &&
				callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
				event.isDefaultPrevented() );
		}
	};

	$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
		$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
			if ( typeof options === "string" ) {
				options = { effect: options };
			}

			var hasOptions;
			var effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;

			options = options || {};
			if ( typeof options === "number" ) {
				options = { duration: options };
			}

			hasOptions = !$.isEmptyObject( options );
			options.complete = callback;

			if ( options.delay ) {
				element.delay( options.delay );
			}

			if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
				element[ method ]( options );
			} else if ( effectName !== method && element[ effectName ] ) {
				element[ effectName ]( options.duration, options.easing, callback );
			} else {
				element.queue( function( next ) {
					$( this )[ method ]();
					if ( callback ) {
						callback.call( element[ 0 ] );
					}
					next();
				} );
			}
		};
	} );

	return $.widget;

	} ) );


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;( function( factory ) {
		if ( true ) {

			// AMD. Register as an anonymous module.
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(2) ], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {

			// Browser globals
			factory( jQuery );
		}
	} ( function( $ ) {

	$.ui = $.ui || {};

	return $.ui.version = "1.12.1";

	} ) );


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _jquery = __webpack_require__(2);

	var _jquery2 = _interopRequireDefault(_jquery);

	__webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var toc;

	var closeToc = function closeToc() {
	  (0, _jquery2.default)(".tocify-wrapper").removeClass('open');
	  (0, _jquery2.default)("#nav-button").removeClass('open');
	};

	var makeToc = function makeToc() {
	  toc = (0, _jquery2.default)("#toc").tocify({
	    selectors: 'h1, h2',
	    extendPage: false,
	    theme: 'none',
	    smoothScroll: true,
	    ignoreSelector: '.toc-ignore',
	    hashGenerator: function hashGenerator(text, element) {
	      return element.prop('id');
	    }
	  }).data('toc-tocify');

	  (0, _jquery2.default)("#nav-button").click(function () {
	    (0, _jquery2.default)(".tocify-wrapper").toggleClass('open');
	    (0, _jquery2.default)("#nav-button").toggleClass('open');
	    return false;
	  });

	  (0, _jquery2.default)(".page-wrapper").click(closeToc);
	  (0, _jquery2.default)(".tocify-item").click(closeToc);
	};

	// Hack to make already open sections to start opened,
	// instead of displaying an ugly animation
	function animate() {
	  setTimeout(function () {
	    toc.setOption('showEffectSpeed', 180);
	  }, 50);
	}

	(0, _jquery2.default)(function () {
	  makeToc();
	  animate();
	});

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* jquery Tocify - v1.9.0 - 2013-10-01
	* http://www.gregfranko.com/jquery.tocify.js/
	* Copyright (c) 2013 Greg Franko; Licensed MIT */

	// Immediately-Invoked Function Expression (IIFE) [Ben Alman Blog Post](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) that calls another IIFE that contains all of the plugin logic.  I used this pattern so that anyone viewing this code would not have to scroll to the bottom of the page to view the local parameters that were passed to the main IIFE.
	(function(tocify) {

	    // ECMAScript 5 Strict Mode: [John Resig Blog Post](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
	    "use strict";

	    // Calls the second IIFE and locally passes in the global jQuery, window, and document objects
	    tocify(window.jQuery, window, document);

	}

	// Locally passes in `jQuery`, the `window` object, the `document` object, and an `undefined` variable.  The `jQuery`, `window` and `document` objects are passed in locally, to improve performance, since javascript first searches for a variable match within the local variables set before searching the global variables set.  All of the global variables are also passed in locally to be minifier friendly. `undefined` can be passed in locally, because it is not a reserved word in JavaScript.
	(function($, window, document, undefined) {

	    // ECMAScript 5 Strict Mode: [John Resig Blog Post](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
	    "use strict";

	    var tocClassName = "tocify",
	        tocClass = "." + tocClassName,
	        tocFocusClassName = "tocify-focus",
	        tocHoverClassName = "tocify-hover",
	        hideTocClassName = "tocify-hide",
	        hideTocClass = "." + hideTocClassName,
	        headerClassName = "tocify-header",
	        headerClass = "." + headerClassName,
	        subheaderClassName = "tocify-subheader",
	        subheaderClass = "." + subheaderClassName,
	        itemClassName = "tocify-item",
	        itemClass = "." + itemClassName,
	        extendPageClassName = "tocify-extend-page",
	        extendPageClass = "." + extendPageClassName;

	    // Calling the jQueryUI Widget Factory Method
	    $.widget("toc.tocify", {

	        //Plugin version
	        version: "1.9.0",

	        // These options will be used as defaults
	        options: {

	            // **context**: Accepts String: Any jQuery selector
	            // The container element that holds all of the elements used to generate the table of contents
	            context: "body",

	            // **ignoreSelector**: Accepts String: Any jQuery selector
	            // A selector to any element that would be matched by selectors that you wish to be ignored
	            ignoreSelector: null,

	            // **selectors**: Accepts an Array of Strings: Any jQuery selectors
	            // The element's used to generate the table of contents.  The order is very important since it will determine the table of content's nesting structure
	            selectors: "h1, h2, h3",

	            // **showAndHide**: Accepts a boolean: true or false
	            // Used to determine if elements should be shown and hidden
	            showAndHide: true,

	            // **showEffect**: Accepts String: "none", "fadeIn", "show", or "slideDown"
	            // Used to display any of the table of contents nested items
	            showEffect: "slideDown",

	            // **showEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
	            // The time duration of the show animation
	            showEffectSpeed: "medium",

	            // **hideEffect**: Accepts String: "none", "fadeOut", "hide", or "slideUp"
	            // Used to hide any of the table of contents nested items
	            hideEffect: "slideUp",

	            // **hideEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
	            // The time duration of the hide animation
	            hideEffectSpeed: "medium",

	            // **smoothScroll**: Accepts a boolean: true or false
	            // Determines if a jQuery animation should be used to scroll to specific table of contents items on the page
	            smoothScroll: true,

	            // **smoothScrollSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
	            // The time duration of the smoothScroll animation
	            smoothScrollSpeed: "medium",

	            // **scrollTo**: Accepts Number (pixels)
	            // The amount of space between the top of page and the selected table of contents item after the page has been scrolled
	            scrollTo: 0,

	            // **showAndHideOnScroll**: Accepts a boolean: true or false
	            // Determines if table of contents nested items should be shown and hidden while scrolling
	            showAndHideOnScroll: true,

	            // **highlightOnScroll**: Accepts a boolean: true or false
	            // Determines if table of contents nested items should be highlighted (set to a different color) while scrolling
	            highlightOnScroll: true,

	            // **highlightOffset**: Accepts a number
	            // The offset distance in pixels to trigger the next active table of contents item
	            highlightOffset: 40,

	            // **theme**: Accepts a string: "bootstrap", "jqueryui", or "none"
	            // Determines if Twitter Bootstrap, jQueryUI, or Tocify classes should be added to the table of contents
	            theme: "bootstrap",

	            // **extendPage**: Accepts a boolean: true or false
	            // If a user scrolls to the bottom of the page and the page is not tall enough to scroll to the last table of contents item, then the page height is increased
	            extendPage: true,

	            // **extendPageOffset**: Accepts a number: pixels
	            // How close to the bottom of the page a user must scroll before the page is extended
	            extendPageOffset: 100,

	            // **history**: Accepts a boolean: true or false
	            // Adds a hash to the page url to maintain history
	            history: true,

	            // **scrollHistory**: Accepts a boolean: true or false
	            // Adds a hash to the page url, to maintain history, when scrolling to a TOC item
	            scrollHistory: false,

	            // **hashGenerator**: How the hash value (the anchor segment of the URL, following the
	            // # character) will be generated.
	            //
	            // "compact" (default) - #CompressesEverythingTogether
	            // "pretty" - #looks-like-a-nice-url-and-is-easily-readable
	            // function(text, element){} - Your own hash generation function that accepts the text as an
	            // argument, and returns the hash value.
	            hashGenerator: "compact",

	            // **highlightDefault**: Accepts a boolean: true or false
	            // Set's the first TOC item as active if no other TOC item is active.
	            highlightDefault: true

	        },

	        // _Create
	        // -------
	        //      Constructs the plugin.  Only called once.
	        _create: function() {

	            var self = this;

	            self.extendPageScroll = true;

	            // Internal array that keeps track of all TOC items (Helps to recognize if there are duplicate TOC item strings)
	            self.items = [];

	            // Generates the HTML for the dynamic table of contents
	            self._generateToc();

	            // Adds CSS classes to the newly generated table of contents HTML
	            self._addCSSClasses();

	            self.webkit = (function() {

	                for(var prop in window) {

	                    if(prop) {

	                        if(prop.toLowerCase().indexOf("webkit") !== -1) {

	                            return true;

	                        }

	                    }

	                }

	                return false;

	            }());

	            // Adds jQuery event handlers to the newly generated table of contents
	            self._setEventHandlers();

	            // Binding to the Window load event to make sure the correct scrollTop is calculated
	            $(window).load(function() {

	                // Sets the active TOC item
	                self._setActiveElement(true);

	                // Once all animations on the page are complete, this callback function will be called
	                $("html, body").promise().done(function() {

	                    setTimeout(function() {

	                        self.extendPageScroll = false;

	                    },0);

	                });

	            });

	        },

	        // _generateToc
	        // ------------
	        //      Generates the HTML for the dynamic table of contents
	        _generateToc: function() {

	            // _Local variables_

	            // Stores the plugin context in the self variable
	            var self = this,

	                // All of the HTML tags found within the context provided (i.e. body) that match the top level jQuery selector above
	                firstElem,

	                // Instantiated variable that will store the top level newly created unordered list DOM element
	                ul,
	                ignoreSelector = self.options.ignoreSelector;

	             // If the selectors option has a comma within the string
	             if(this.options.selectors.indexOf(",") !== -1) {

	                 // Grabs the first selector from the string
	                 firstElem = $(this.options.context).find(this.options.selectors.replace(/ /g,"").substr(0, this.options.selectors.indexOf(",")));

	             }

	             // If the selectors option does not have a comman within the string
	             else {

	                 // Grabs the first selector from the string and makes sure there are no spaces
	                 firstElem = $(this.options.context).find(this.options.selectors.replace(/ /g,""));

	             }

	            if(!firstElem.length) {

	                self.element.addClass(hideTocClassName);

	                return;

	            }

	            self.element.addClass(tocClassName);

	            // Loops through each top level selector
	            firstElem.each(function(index) {

	                //If the element matches the ignoreSelector then we skip it
	                if($(this).is(ignoreSelector)) {
	                    return;
	                }

	                // Creates an unordered list HTML element and adds a dynamic ID and standard class name
	                ul = $("<ul/>", {
	                    "id": headerClassName + index,
	                    "class": headerClassName
	                }).

	                // Appends a top level list item HTML element to the previously created HTML header
	                append(self._nestElements($(this), index));

	                // Add the created unordered list element to the HTML element calling the plugin
	                self.element.append(ul);

	                // Finds all of the HTML tags between the header and subheader elements
	                $(this).nextUntil(this.nodeName.toLowerCase()).each(function() {

	                    // If there are no nested subheader elemements
	                    if($(this).find(self.options.selectors).length === 0) {

	                        // Loops through all of the subheader elements
	                        $(this).filter(self.options.selectors).each(function() {

	                            //If the element matches the ignoreSelector then we skip it
	                            if($(this).is(ignoreSelector)) {
	                                return;
	                            }

	                            self._appendSubheaders.call(this, self, ul);

	                        });

	                    }

	                    // If there are nested subheader elements
	                    else {

	                        // Loops through all of the subheader elements
	                        $(this).find(self.options.selectors).each(function() {

	                            //If the element matches the ignoreSelector then we skip it
	                            if($(this).is(ignoreSelector)) {
	                                return;
	                            }

	                            self._appendSubheaders.call(this, self, ul);

	                        });

	                    }

	                });

	            });

	        },

	        _setActiveElement: function(pageload) {

	            var self = this,

	                hash = window.location.hash.substring(1),

	                elem = self.element.find('li[data-unique="' + hash + '"]');

	            if(hash.length) {

	                // Removes highlighting from all of the list item's
	                self.element.find("." + self.focusClass).removeClass(self.focusClass);

	                // Highlights the current list item that was clicked
	                elem.addClass(self.focusClass);

	                // If the showAndHide option is true
	                if(self.options.showAndHide) {

	                    // Triggers the click event on the currently focused TOC item
	                    elem.click();

	                }

	            }

	            else {

	                // Removes highlighting from all of the list item's
	                self.element.find("." + self.focusClass).removeClass(self.focusClass);

	                if(!hash.length && pageload && self.options.highlightDefault) {

	                    // Highlights the first TOC item if no other items are highlighted
	                    self.element.find(itemClass).first().addClass(self.focusClass);

	                }

	            }

	            return self;

	        },

	        // _nestElements
	        // -------------
	        //      Helps create the table of contents list by appending nested list items
	        _nestElements: function(self, index) {

	            var arr, item, hashValue;

	            arr = $.grep(this.items, function (item) {

	                return item === self.text();

	            });

	            // If there is already a duplicate TOC item
	            if(arr.length) {

	                // Adds the current TOC item text and index (for slight randomization) to the internal array
	                this.items.push(self.text() + index);

	            }

	            // If there not a duplicate TOC item
	            else {

	                // Adds the current TOC item text to the internal array
	                this.items.push(self.text());

	            }

	            hashValue = this._generateHashValue(arr, self, index);

	            // Appends a list item HTML element to the last unordered list HTML element found within the HTML element calling the plugin
	            item = $("<li/>", {

	                // Sets a common class name to the list item
	                "class": itemClassName,

	                "data-unique": hashValue

	            }).append($("<a/>", {

	                "text": self.text()

	            }));

	            // Adds an HTML anchor tag before the currently traversed HTML element
	            self.before($("<div/>", {

	                // Sets a name attribute on the anchor tag to the text of the currently traversed HTML element (also making sure that all whitespace is replaced with an underscore)
	                "name": hashValue,

	                "data-unique": hashValue

	            }));

	            return item;

	        },

	        // _generateHashValue
	        // ------------------
	        //      Generates the hash value that will be used to refer to each item.
	        _generateHashValue: function(arr, self, index) {

	            var hashValue = "",
	                hashGeneratorOption = this.options.hashGenerator;

	            if (hashGeneratorOption === "pretty") {

	                // prettify the text
	                hashValue = self.text().toLowerCase().replace(/\s/g, "-");

	                // fix double hyphens
	                while (hashValue.indexOf("--") > -1) {
	                    hashValue = hashValue.replace(/--/g, "-");
	                }

	                // fix colon-space instances
	                while (hashValue.indexOf(":-") > -1) {
	                    hashValue = hashValue.replace(/:-/g, "-");
	                }

	            } else if (typeof hashGeneratorOption === "function") {

	                // call the function
	                hashValue = hashGeneratorOption(self.text(), self);

	            } else {

	                // compact - the default
	                hashValue = self.text().replace(/\s/g, "");

	            }

	            // add the index if we need to
	            if (arr.length) { hashValue += ""+index; }

	            // return the value
	            return hashValue;

	        },

	        // _appendElements
	        // ---------------
	        //      Helps create the table of contents list by appending subheader elements

	        _appendSubheaders: function(self, ul) {

	            // The current element index
	            var index = $(this).index(self.options.selectors),

	                // Finds the previous header DOM element
	                previousHeader = $(self.options.selectors).eq(index - 1),

	                currentTagName = +$(this).prop("tagName").charAt(1),

	                previousTagName = +previousHeader.prop("tagName").charAt(1),

	                lastSubheader;

	            // If the current header DOM element is smaller than the previous header DOM element or the first subheader
	            if(currentTagName < previousTagName) {

	                // Selects the last unordered list HTML found within the HTML element calling the plugin
	                self.element.find(subheaderClass + "[data-tag=" + currentTagName + "]").last().append(self._nestElements($(this), index));

	            }

	            // If the current header DOM element is the same type of header(eg. h4) as the previous header DOM element
	            else if(currentTagName === previousTagName) {

	                ul.find(itemClass).last().after(self._nestElements($(this), index));

	            }

	            else {

	                // Selects the last unordered list HTML found within the HTML element calling the plugin
	                ul.find(itemClass).last().

	                // Appends an unorderedList HTML element to the dynamic `unorderedList` variable and sets a common class name
	                after($("<ul/>", {

	                    "class": subheaderClassName,

	                    "data-tag": currentTagName

	                })).next(subheaderClass).

	                // Appends a list item HTML element to the last unordered list HTML element found within the HTML element calling the plugin
	                append(self._nestElements($(this), index));
	            }

	        },

	       // _setEventHandlers
	        // ----------------
	        //      Adds jQuery event handlers to the newly generated table of contents
	        _setEventHandlers: function() {

	            // _Local variables_

	            // Stores the plugin context in the self variable
	            var self = this,

	                // Instantiates a new variable that will be used to hold a specific element's context
	                $self,

	                // Instantiates a new variable that will be used to determine the smoothScroll animation time duration
	                duration;

	            // Event delegation that looks for any clicks on list item elements inside of the HTML element calling the plugin
	            this.element.on("click.tocify", "li", function(event) {

	                if(self.options.history) {

	                    window.location.hash = $(this).attr("data-unique");

	                }

	                // Removes highlighting from all of the list item's
	                self.element.find("." + self.focusClass).removeClass(self.focusClass);

	                // Highlights the current list item that was clicked
	                $(this).addClass(self.focusClass);

	                // If the showAndHide option is true
	                if(self.options.showAndHide) {

	                    var elem = $('li[data-unique="' + $(this).attr("data-unique") + '"]');

	                    self._triggerShow(elem);

	                }

	                self._scrollTo($(this));

	            });

	            // Mouseenter and Mouseleave event handlers for the list item's within the HTML element calling the plugin
	            this.element.find("li").on({

	                // Mouseenter event handler
	                "mouseenter.tocify": function() {

	                    // Adds a hover CSS class to the current list item
	                    $(this).addClass(self.hoverClass);

	                    // Makes sure the cursor is set to the pointer icon
	                    $(this).css("cursor", "pointer");

	                },

	                // Mouseleave event handler
	                "mouseleave.tocify": function() {

	                    if(self.options.theme !== "bootstrap") {

	                        // Removes the hover CSS class from the current list item
	                        $(this).removeClass(self.hoverClass);

	                    }

	                }
	            });

	            // only attach handler if needed (expensive in IE)
	            if (self.options.extendPage || self.options.highlightOnScroll || self.options.scrollHistory || self.options.showAndHideOnScroll)
	            {
	            // Window scroll event handler
	                $(window).on("scroll.tocify", function() {

	                    // Once all animations on the page are complete, this callback function will be called
	                    $("html, body").promise().done(function() {

	                        // Local variables

	                        // Stores how far the user has scrolled
	                        var winScrollTop = $(window).scrollTop(),

	                            // Stores the height of the window
	                            winHeight = $(window).height(),

	                            // Stores the height of the document
	                            docHeight = $(document).height(),

	                            scrollHeight = $("body")[0].scrollHeight,

	                            // Instantiates a variable that will be used to hold a selected HTML element
	                            elem,

	                            lastElem,

	                            lastElemOffset,

	                            currentElem;

	                        if(self.options.extendPage) {

	                            // If the user has scrolled to the bottom of the page and the last toc item is not focused
	                            if((self.webkit && winScrollTop >= scrollHeight - winHeight - self.options.extendPageOffset) || (!self.webkit && winHeight + winScrollTop > docHeight - self.options.extendPageOffset)) {

	                                if(!$(extendPageClass).length) {

	                                    lastElem = $('div[data-unique="' + $(itemClass).last().attr("data-unique") + '"]');

	                                    if(!lastElem.length) return;

	                                    // Gets the top offset of the page header that is linked to the last toc item
	                                    lastElemOffset = lastElem.offset().top;

	                                    // Appends a div to the bottom of the page and sets the height to the difference of the window scrollTop and the last element's position top offset
	                                    $(self.options.context).append($("<div />", {

	                                        "class": extendPageClassName,

	                                        "height": Math.abs(lastElemOffset - winScrollTop) + "px",

	                                        "data-unique": extendPageClassName

	                                    }));

	                                    if(self.extendPageScroll) {

	                                        currentElem = self.element.find('li.active');

	                                        self._scrollTo($('div[data-unique="' + currentElem.attr("data-unique") + '"]'));

	                                    }

	                                }

	                            }

	                        }

	                        // The zero timeout ensures the following code is run after the scroll events
	                        setTimeout(function() {

	                            // _Local variables_

	                            // Stores the distance to the closest anchor
	                            var closestAnchorDistance = null,

	                                // Stores the index of the closest anchor
	                                closestAnchorIdx = null,

	                                // Keeps a reference to all anchors
	                                anchors = $(self.options.context).find("div[data-unique]"),

	                                anchorText;

	                            // Determines the index of the closest anchor
	                            anchors.each(function(idx) {
	                                var distance = Math.abs(($(this).next().length ? $(this).next() : $(this)).offset().top - winScrollTop - self.options.highlightOffset);
	                                if (closestAnchorDistance == null || distance < closestAnchorDistance) {
	                                    closestAnchorDistance = distance;
	                                    closestAnchorIdx = idx;
	                                } else {
	                                    return false;
	                                }
	                            });

	                            anchorText = $(anchors[closestAnchorIdx]).attr("data-unique");

	                            // Stores the list item HTML element that corresponds to the currently traversed anchor tag
	                            elem = $('li[data-unique="' + anchorText + '"]');

	                            // If the `highlightOnScroll` option is true and a next element is found
	                            if(self.options.highlightOnScroll && elem.length) {

	                                // Removes highlighting from all of the list item's
	                                self.element.find("." + self.focusClass).removeClass(self.focusClass);

	                                // Highlights the corresponding list item
	                                elem.addClass(self.focusClass);

	                            }

	                            if(self.options.scrollHistory) {

	                                if(window.location.hash !== "#" + anchorText) {

	                                    window.location.replace("#" + anchorText);

	                                }
	                            }

	                            // If the `showAndHideOnScroll` option is true
	                            if(self.options.showAndHideOnScroll && self.options.showAndHide) {

	                                self._triggerShow(elem, true);

	                            }

	                        }, 0);

	                    });

	                });
	            }

	        },

	        // Show
	        // ----
	        //      Opens the current sub-header
	        show: function(elem, scroll) {

	            // Stores the plugin context in the `self` variable
	            var self = this,
	                element = elem;

	            // If the sub-header is not already visible
	            if (!elem.is(":visible")) {

	                // If the current element does not have any nested subheaders, is not a header, and its parent is not visible
	                if(!elem.find(subheaderClass).length && !elem.parent().is(headerClass) && !elem.parent().is(":visible")) {

	                    // Sets the current element to all of the subheaders within the current header
	                    elem = elem.parents(subheaderClass).add(elem);

	                }

	                // If the current element does not have any nested subheaders and is not a header
	                else if(!elem.children(subheaderClass).length && !elem.parent().is(headerClass)) {

	                    // Sets the current element to the closest subheader
	                    elem = elem.closest(subheaderClass);

	                }

	                //Determines what jQuery effect to use
	                switch (self.options.showEffect) {

	                    //Uses `no effect`
	                    case "none":

	                        elem.show();

	                    break;

	                    //Uses the jQuery `show` special effect
	                    case "show":

	                        elem.show(self.options.showEffectSpeed);

	                    break;

	                    //Uses the jQuery `slideDown` special effect
	                    case "slideDown":

	                        elem.slideDown(self.options.showEffectSpeed);

	                    break;

	                    //Uses the jQuery `fadeIn` special effect
	                    case "fadeIn":

	                        elem.fadeIn(self.options.showEffectSpeed);

	                    break;

	                    //If none of the above options were passed, then a `jQueryUI show effect` is expected
	                    default:

	                        elem.show();

	                    break;

	                }

	            }

	            // If the current subheader parent element is a header
	            if(elem.parent().is(headerClass)) {

	                // Hides all non-active sub-headers
	                self.hide($(subheaderClass).not(elem));

	            }

	            // If the current subheader parent element is not a header
	            else {

	                // Hides all non-active sub-headers
	                self.hide($(subheaderClass).not(elem.closest(headerClass).find(subheaderClass).not(elem.siblings())));

	            }

	            // Maintains chainablity
	            return self;

	        },

	        // Hide
	        // ----
	        //      Closes the current sub-header
	        hide: function(elem) {

	            // Stores the plugin context in the `self` variable
	            var self = this;

	            //Determines what jQuery effect to use
	            switch (self.options.hideEffect) {

	                // Uses `no effect`
	                case "none":

	                    elem.hide();

	                break;

	                // Uses the jQuery `hide` special effect
	                case "hide":

	                    elem.hide(self.options.hideEffectSpeed);

	                break;

	                // Uses the jQuery `slideUp` special effect
	                case "slideUp":

	                    elem.slideUp(self.options.hideEffectSpeed);

	                break;

	                // Uses the jQuery `fadeOut` special effect
	                case "fadeOut":

	                    elem.fadeOut(self.options.hideEffectSpeed);

	                break;

	                // If none of the above options were passed, then a `jqueryUI hide effect` is expected
	                default:

	                    elem.hide();

	                break;

	            }

	            // Maintains chainablity
	            return self;
	        },

	        // _triggerShow
	        // ------------
	        //      Determines what elements get shown on scroll and click
	        _triggerShow: function(elem, scroll) {

	            var self = this;

	            // If the current element's parent is a header element or the next element is a nested subheader element
	            if(elem.parent().is(headerClass) || elem.next().is(subheaderClass)) {

	                // Shows the next sub-header element
	                self.show(elem.next(subheaderClass), scroll);

	            }

	            // If the current element's parent is a subheader element
	            else if(elem.parent().is(subheaderClass)) {

	                // Shows the parent sub-header element
	                self.show(elem.parent(), scroll);

	            }

	            // Maintains chainability
	            return self;

	        },

	        // _addCSSClasses
	        // --------------
	        //      Adds CSS classes to the newly generated table of contents HTML
	        _addCSSClasses: function() {

	            // If the user wants a jqueryUI theme
	            if(this.options.theme === "jqueryui") {

	                this.focusClass = "ui-state-default";

	                this.hoverClass = "ui-state-hover";

	                //Adds the default styling to the dropdown list
	                this.element.addClass("ui-widget").find(".toc-title").addClass("ui-widget-header").end().find("li").addClass("ui-widget-content");

	            }

	            // If the user wants a twitterBootstrap theme
	            else if(this.options.theme === "bootstrap") {

	                this.element.find(headerClass + "," + subheaderClass).addClass("nav nav-list");

	                this.focusClass = "active";

	            }

	            // If a user does not want a prebuilt theme
	            else {

	                // Adds more neutral classes (instead of jqueryui)

	                this.focusClass = tocFocusClassName;

	                this.hoverClass = tocHoverClassName;

	            }

	            //Maintains chainability
	            return this;

	        },

	        // setOption
	        // ---------
	        //      Sets a single Tocify option after the plugin is invoked
	        setOption: function() {

	            // Calls the jQueryUI Widget Factory setOption method
	            $.Widget.prototype._setOption.apply(this, arguments);

	        },

	        // setOptions
	        // ----------
	        //      Sets a single or multiple Tocify options after the plugin is invoked
	        setOptions: function() {

	            // Calls the jQueryUI Widget Factory setOptions method
	            $.Widget.prototype._setOptions.apply(this, arguments);

	        },

	        // _scrollTo
	        // ---------
	        //      Scrolls to a specific element
	        _scrollTo: function(elem) {

	            var self = this,
	                duration = self.options.smoothScroll || 0,
	                scrollTo = self.options.scrollTo,
	                currentDiv = $('div[data-unique="' + elem.attr("data-unique") + '"]');

	            if(!currentDiv.length) {

	                return self;

	            }

	            // Once all animations on the page are complete, this callback function will be called
	            $("html, body").promise().done(function() {

	                // Animates the html and body element scrolltops
	                $("html, body").animate({

	                    // Sets the jQuery `scrollTop` to the top offset of the HTML div tag that matches the current list item's `data-unique` tag
	                    "scrollTop": currentDiv.offset().top - ($.isFunction(scrollTo) ? scrollTo.call() : scrollTo) + "px"

	                }, {

	                    // Sets the smoothScroll animation time duration to the smoothScrollSpeed option
	                    "duration": duration

	                });

	            });

	            // Maintains chainability
	            return self;

	        }

	    });

	})); //end of plugin


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _lunr = __webpack_require__(7);

	var _lunr2 = _interopRequireDefault(_lunr);

	__webpack_require__(8);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* globals $ */
	var content, searchResults;
	var highlightOpts = { element: 'span', className: 'search-highlight' };

	var index = new _lunr2.default.Index();

	index.ref('id');
	index.field('title', { boost: 10 });
	index.field('body');
	index.pipeline.add(_lunr2.default.trimmer, _lunr2.default.stopWordFilter);

	$(populate);
	$(bind);

	function populate() {
	  $('h1, h2').each(function () {
	    var title = $(this);
	    var body = title.nextUntil('h1, h2');
	    index.add({
	      id: title.prop('id'),
	      title: title.text(),
	      body: body.text()
	    });
	  });
	}

	function bind() {
	  content = $('.content');
	  searchResults = $('.search-results');

	  $('#input-search').on('keyup', search);
	}

	function search(event) {
	  unhighlight();
	  searchResults.addClass('visible');

	  // ESC clears the field
	  if (event.keyCode === 27) this.value = '';

	  if (this.value) {
	    var results = index.search(this.value).filter(function (r) {
	      return r.score > 0.0001;
	    });

	    if (results.length) {
	      searchResults.empty();
	      $.each(results, function (index, result) {
	        var elem = document.getElementById(result.ref);
	        searchResults.append("<li><a href='#" + result.ref + "'>" + $(elem).text() + "</a></li>");
	      });
	      highlight.call(this);
	    } else {
	      searchResults.html('<li></li>');
	      $('.search-results li').text('No Results Found for "' + this.value + '"');
	    }
	  } else {
	    unhighlight();
	    searchResults.removeClass('visible');
	  }
	}

	function highlight() {
	  if (this.value) content.highlight(this.value, highlightOpts);
	}

	function unhighlight() {
	  content.unhighlight(highlightOpts);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 0.7.2
	 * Copyright (C) 2016 Oliver Nightingale
	 * @license MIT
	 */

	;(function(){

	/**
	 * Convenience function for instantiating a new lunr index and configuring it
	 * with the default pipeline functions and the passed config function.
	 *
	 * When using this convenience function a new index will be created with the
	 * following functions already in the pipeline:
	 *
	 * lunr.StopWordFilter - filters out any stop words before they enter the
	 * index
	 *
	 * lunr.stemmer - stems the tokens before entering the index.
	 *
	 * Example:
	 *
	 *     var idx = lunr(function () {
	 *       this.field('title', 10)
	 *       this.field('tags', 100)
	 *       this.field('body')
	 *       
	 *       this.ref('cid')
	 *       
	 *       this.pipeline.add(function () {
	 *         // some custom pipeline function
	 *       })
	 *       
	 *     })
	 *
	 * @param {Function} config A function that will be called with the new instance
	 * of the lunr.Index as both its context and first parameter. It can be used to
	 * customize the instance of new lunr.Index.
	 * @namespace
	 * @module
	 * @returns {lunr.Index}
	 *
	 */
	var lunr = function (config) {
	  var idx = new lunr.Index

	  idx.pipeline.add(
	    lunr.trimmer,
	    lunr.stopWordFilter,
	    lunr.stemmer
	  )

	  if (config) config.call(idx, idx)

	  return idx
	}

	lunr.version = "0.7.2"
	/*!
	 * lunr.utils
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * A namespace containing utils for the rest of the lunr library
	 */
	lunr.utils = {}

	/**
	 * Print a warning message to the console.
	 *
	 * @param {String} message The message to be printed.
	 * @memberOf Utils
	 */
	lunr.utils.warn = (function (global) {
	  return function (message) {
	    if (global.console && console.warn) {
	      console.warn(message)
	    }
	  }
	})(this)

	/**
	 * Convert an object to a string.
	 *
	 * In the case of `null` and `undefined` the function returns
	 * the empty string, in all other cases the result of calling
	 * `toString` on the passed object is returned.
	 *
	 * @param {Any} obj The object to convert to a string.
	 * @return {String} string representation of the passed object.
	 * @memberOf Utils
	 */
	lunr.utils.asString = function (obj) {
	  if (obj === void 0 || obj === null) {
	    return ""
	  } else {
	    return obj.toString()
	  }
	}
	/*!
	 * lunr.EventEmitter
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.EventEmitter is an event emitter for lunr. It manages adding and removing event handlers and triggering events and their handlers.
	 *
	 * @constructor
	 */
	lunr.EventEmitter = function () {
	  this.events = {}
	}

	/**
	 * Binds a handler function to a specific event(s).
	 *
	 * Can bind a single function to many different events in one call.
	 *
	 * @param {String} [eventName] The name(s) of events to bind this function to.
	 * @param {Function} fn The function to call when an event is fired.
	 * @memberOf EventEmitter
	 */
	lunr.EventEmitter.prototype.addListener = function () {
	  var args = Array.prototype.slice.call(arguments),
	      fn = args.pop(),
	      names = args

	  if (typeof fn !== "function") throw new TypeError ("last argument must be a function")

	  names.forEach(function (name) {
	    if (!this.hasHandler(name)) this.events[name] = []
	    this.events[name].push(fn)
	  }, this)
	}

	/**
	 * Removes a handler function from a specific event.
	 *
	 * @param {String} eventName The name of the event to remove this function from.
	 * @param {Function} fn The function to remove from an event.
	 * @memberOf EventEmitter
	 */
	lunr.EventEmitter.prototype.removeListener = function (name, fn) {
	  if (!this.hasHandler(name)) return

	  var fnIndex = this.events[name].indexOf(fn)
	  this.events[name].splice(fnIndex, 1)

	  if (!this.events[name].length) delete this.events[name]
	}

	/**
	 * Calls all functions bound to the given event.
	 *
	 * Additional data can be passed to the event handler as arguments to `emit`
	 * after the event name.
	 *
	 * @param {String} eventName The name of the event to emit.
	 * @memberOf EventEmitter
	 */
	lunr.EventEmitter.prototype.emit = function (name) {
	  if (!this.hasHandler(name)) return

	  var args = Array.prototype.slice.call(arguments, 1)

	  this.events[name].forEach(function (fn) {
	    fn.apply(undefined, args)
	  })
	}

	/**
	 * Checks whether a handler has ever been stored against an event.
	 *
	 * @param {String} eventName The name of the event to check.
	 * @private
	 * @memberOf EventEmitter
	 */
	lunr.EventEmitter.prototype.hasHandler = function (name) {
	  return name in this.events
	}

	/*!
	 * lunr.tokenizer
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * A function for splitting a string into tokens ready to be inserted into
	 * the search index. Uses `lunr.tokenizer.separator` to split strings, change
	 * the value of this property to change how strings are split into tokens.
	 *
	 * @module
	 * @param {String} obj The string to convert into tokens
	 * @see lunr.tokenizer.separator
	 * @returns {Array}
	 */
	lunr.tokenizer = function (obj) {
	  if (!arguments.length || obj == null || obj == undefined) return []
	  if (Array.isArray(obj)) return obj.map(function (t) { return lunr.utils.asString(t).toLowerCase() })

	  // TODO: This exists so that the deprecated property lunr.tokenizer.seperator can still be used. By
	  // default it is set to false and so the correctly spelt lunr.tokenizer.separator is used unless
	  // the user is using the old property to customise the tokenizer.
	  //
	  // This should be removed when version 1.0.0 is released.
	  var separator = lunr.tokenizer.seperator || lunr.tokenizer.separator

	  return obj.toString().trim().toLowerCase().split(separator)
	}

	/**
	 * This property is legacy alias for lunr.tokenizer.separator to maintain backwards compatability.
	 * When introduced the token was spelt incorrectly. It will remain until 1.0.0 when it will be removed,
	 * all code should use the correctly spelt lunr.tokenizer.separator property instead.
	 *
	 * @static
	 * @see lunr.tokenizer.separator
	 * @deprecated since 0.7.2 will be removed in 1.0.0
	 * @private
	 * @see lunr.tokenizer
	 */
	lunr.tokenizer.seperator = false

	/**
	 * The sperator used to split a string into tokens. Override this property to change the behaviour of
	 * `lunr.tokenizer` behaviour when tokenizing strings. By default this splits on whitespace and hyphens.
	 *
	 * @static
	 * @see lunr.tokenizer
	 */
	lunr.tokenizer.separator = /[\s\-]+/

	/**
	 * Loads a previously serialised tokenizer.
	 *
	 * A tokenizer function to be loaded must already be registered with lunr.tokenizer.
	 * If the serialised tokenizer has not been registered then an error will be thrown.
	 *
	 * @param {String} label The label of the serialised tokenizer.
	 * @returns {Function}
	 * @memberOf tokenizer
	 */
	lunr.tokenizer.load = function (label) {
	  var fn = this.registeredFunctions[label]

	  if (!fn) {
	    throw new Error('Cannot load un-registered function: ' + label)
	  }

	  return fn
	}

	lunr.tokenizer.label = 'default'

	lunr.tokenizer.registeredFunctions = {
	  'default': lunr.tokenizer
	}

	/**
	 * Register a tokenizer function.
	 *
	 * Functions that are used as tokenizers should be registered if they are to be used with a serialised index.
	 *
	 * Registering a function does not add it to an index, functions must still be associated with a specific index for them to be used when indexing and searching documents.
	 *
	 * @param {Function} fn The function to register.
	 * @param {String} label The label to register this function with
	 * @memberOf tokenizer
	 */
	lunr.tokenizer.registerFunction = function (fn, label) {
	  if (label in this.registeredFunctions) {
	    lunr.utils.warn('Overwriting existing tokenizer: ' + label)
	  }

	  fn.label = label
	  this.registeredFunctions[label] = fn
	}
	/*!
	 * lunr.Pipeline
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.Pipelines maintain an ordered list of functions to be applied to all
	 * tokens in documents entering the search index and queries being ran against
	 * the index.
	 *
	 * An instance of lunr.Index created with the lunr shortcut will contain a
	 * pipeline with a stop word filter and an English language stemmer. Extra
	 * functions can be added before or after either of these functions or these
	 * default functions can be removed.
	 *
	 * When run the pipeline will call each function in turn, passing a token, the
	 * index of that token in the original list of all tokens and finally a list of
	 * all the original tokens.
	 *
	 * The output of functions in the pipeline will be passed to the next function
	 * in the pipeline. To exclude a token from entering the index the function
	 * should return undefined, the rest of the pipeline will not be called with
	 * this token.
	 *
	 * For serialisation of pipelines to work, all functions used in an instance of
	 * a pipeline should be registered with lunr.Pipeline. Registered functions can
	 * then be loaded. If trying to load a serialised pipeline that uses functions
	 * that are not registered an error will be thrown.
	 *
	 * If not planning on serialising the pipeline then registering pipeline functions
	 * is not necessary.
	 *
	 * @constructor
	 */
	lunr.Pipeline = function () {
	  this._stack = []
	}

	lunr.Pipeline.registeredFunctions = {}

	/**
	 * Register a function with the pipeline.
	 *
	 * Functions that are used in the pipeline should be registered if the pipeline
	 * needs to be serialised, or a serialised pipeline needs to be loaded.
	 *
	 * Registering a function does not add it to a pipeline, functions must still be
	 * added to instances of the pipeline for them to be used when running a pipeline.
	 *
	 * @param {Function} fn The function to check for.
	 * @param {String} label The label to register this function with
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.registerFunction = function (fn, label) {
	  if (label in this.registeredFunctions) {
	    lunr.utils.warn('Overwriting existing registered function: ' + label)
	  }

	  fn.label = label
	  lunr.Pipeline.registeredFunctions[fn.label] = fn
	}

	/**
	 * Warns if the function is not registered as a Pipeline function.
	 *
	 * @param {Function} fn The function to check for.
	 * @private
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.warnIfFunctionNotRegistered = function (fn) {
	  var isRegistered = fn.label && (fn.label in this.registeredFunctions)

	  if (!isRegistered) {
	    lunr.utils.warn('Function is not registered with pipeline. This may cause problems when serialising the index.\n', fn)
	  }
	}

	/**
	 * Loads a previously serialised pipeline.
	 *
	 * All functions to be loaded must already be registered with lunr.Pipeline.
	 * If any function from the serialised data has not been registered then an
	 * error will be thrown.
	 *
	 * @param {Object} serialised The serialised pipeline to load.
	 * @returns {lunr.Pipeline}
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.load = function (serialised) {
	  var pipeline = new lunr.Pipeline

	  serialised.forEach(function (fnName) {
	    var fn = lunr.Pipeline.registeredFunctions[fnName]

	    if (fn) {
	      pipeline.add(fn)
	    } else {
	      throw new Error('Cannot load un-registered function: ' + fnName)
	    }
	  })

	  return pipeline
	}

	/**
	 * Adds new functions to the end of the pipeline.
	 *
	 * Logs a warning if the function has not been registered.
	 *
	 * @param {Function} functions Any number of functions to add to the pipeline.
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.add = function () {
	  var fns = Array.prototype.slice.call(arguments)

	  fns.forEach(function (fn) {
	    lunr.Pipeline.warnIfFunctionNotRegistered(fn)
	    this._stack.push(fn)
	  }, this)
	}

	/**
	 * Adds a single function after a function that already exists in the
	 * pipeline.
	 *
	 * Logs a warning if the function has not been registered.
	 *
	 * @param {Function} existingFn A function that already exists in the pipeline.
	 * @param {Function} newFn The new function to add to the pipeline.
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.after = function (existingFn, newFn) {
	  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

	  var pos = this._stack.indexOf(existingFn)
	  if (pos == -1) {
	    throw new Error('Cannot find existingFn')
	  }

	  pos = pos + 1
	  this._stack.splice(pos, 0, newFn)
	}

	/**
	 * Adds a single function before a function that already exists in the
	 * pipeline.
	 *
	 * Logs a warning if the function has not been registered.
	 *
	 * @param {Function} existingFn A function that already exists in the pipeline.
	 * @param {Function} newFn The new function to add to the pipeline.
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.before = function (existingFn, newFn) {
	  lunr.Pipeline.warnIfFunctionNotRegistered(newFn)

	  var pos = this._stack.indexOf(existingFn)
	  if (pos == -1) {
	    throw new Error('Cannot find existingFn')
	  }

	  this._stack.splice(pos, 0, newFn)
	}

	/**
	 * Removes a function from the pipeline.
	 *
	 * @param {Function} fn The function to remove from the pipeline.
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.remove = function (fn) {
	  var pos = this._stack.indexOf(fn)
	  if (pos == -1) {
	    return
	  }

	  this._stack.splice(pos, 1)
	}

	/**
	 * Runs the current list of functions that make up the pipeline against the
	 * passed tokens.
	 *
	 * @param {Array} tokens The tokens to run through the pipeline.
	 * @returns {Array}
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.run = function (tokens) {
	  var out = [],
	      tokenLength = tokens.length,
	      stackLength = this._stack.length

	  for (var i = 0; i < tokenLength; i++) {
	    var token = tokens[i]

	    for (var j = 0; j < stackLength; j++) {
	      token = this._stack[j](token, i, tokens)
	      if (token === void 0 || token === '') break
	    };

	    if (token !== void 0 && token !== '') out.push(token)
	  };

	  return out
	}

	/**
	 * Resets the pipeline by removing any existing processors.
	 *
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.reset = function () {
	  this._stack = []
	}

	/**
	 * Returns a representation of the pipeline ready for serialisation.
	 *
	 * Logs a warning if the function has not been registered.
	 *
	 * @returns {Array}
	 * @memberOf Pipeline
	 */
	lunr.Pipeline.prototype.toJSON = function () {
	  return this._stack.map(function (fn) {
	    lunr.Pipeline.warnIfFunctionNotRegistered(fn)

	    return fn.label
	  })
	}
	/*!
	 * lunr.Vector
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.Vectors implement vector related operations for
	 * a series of elements.
	 *
	 * @constructor
	 */
	lunr.Vector = function () {
	  this._magnitude = null
	  this.list = undefined
	  this.length = 0
	}

	/**
	 * lunr.Vector.Node is a simple struct for each node
	 * in a lunr.Vector.
	 *
	 * @private
	 * @param {Number} The index of the node in the vector.
	 * @param {Object} The data at this node in the vector.
	 * @param {lunr.Vector.Node} The node directly after this node in the vector.
	 * @constructor
	 * @memberOf Vector
	 */
	lunr.Vector.Node = function (idx, val, next) {
	  this.idx = idx
	  this.val = val
	  this.next = next
	}

	/**
	 * Inserts a new value at a position in a vector.
	 *
	 * @param {Number} The index at which to insert a value.
	 * @param {Object} The object to insert in the vector.
	 * @memberOf Vector.
	 */
	lunr.Vector.prototype.insert = function (idx, val) {
	  this._magnitude = undefined;
	  var list = this.list

	  if (!list) {
	    this.list = new lunr.Vector.Node (idx, val, list)
	    return this.length++
	  }

	  if (idx < list.idx) {
	    this.list = new lunr.Vector.Node (idx, val, list)
	    return this.length++
	  }

	  var prev = list,
	      next = list.next

	  while (next != undefined) {
	    if (idx < next.idx) {
	      prev.next = new lunr.Vector.Node (idx, val, next)
	      return this.length++
	    }

	    prev = next, next = next.next
	  }

	  prev.next = new lunr.Vector.Node (idx, val, next)
	  return this.length++
	}

	/**
	 * Calculates the magnitude of this vector.
	 *
	 * @returns {Number}
	 * @memberOf Vector
	 */
	lunr.Vector.prototype.magnitude = function () {
	  if (this._magnitude) return this._magnitude
	  var node = this.list,
	      sumOfSquares = 0,
	      val

	  while (node) {
	    val = node.val
	    sumOfSquares += val * val
	    node = node.next
	  }

	  return this._magnitude = Math.sqrt(sumOfSquares)
	}

	/**
	 * Calculates the dot product of this vector and another vector.
	 *
	 * @param {lunr.Vector} otherVector The vector to compute the dot product with.
	 * @returns {Number}
	 * @memberOf Vector
	 */
	lunr.Vector.prototype.dot = function (otherVector) {
	  var node = this.list,
	      otherNode = otherVector.list,
	      dotProduct = 0

	  while (node && otherNode) {
	    if (node.idx < otherNode.idx) {
	      node = node.next
	    } else if (node.idx > otherNode.idx) {
	      otherNode = otherNode.next
	    } else {
	      dotProduct += node.val * otherNode.val
	      node = node.next
	      otherNode = otherNode.next
	    }
	  }

	  return dotProduct
	}

	/**
	 * Calculates the cosine similarity between this vector and another
	 * vector.
	 *
	 * @param {lunr.Vector} otherVector The other vector to calculate the
	 * similarity with.
	 * @returns {Number}
	 * @memberOf Vector
	 */
	lunr.Vector.prototype.similarity = function (otherVector) {
	  return this.dot(otherVector) / (this.magnitude() * otherVector.magnitude())
	}
	/*!
	 * lunr.SortedSet
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.SortedSets are used to maintain an array of uniq values in a sorted
	 * order.
	 *
	 * @constructor
	 */
	lunr.SortedSet = function () {
	  this.length = 0
	  this.elements = []
	}

	/**
	 * Loads a previously serialised sorted set.
	 *
	 * @param {Array} serialisedData The serialised set to load.
	 * @returns {lunr.SortedSet}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.load = function (serialisedData) {
	  var set = new this

	  set.elements = serialisedData
	  set.length = serialisedData.length

	  return set
	}

	/**
	 * Inserts new items into the set in the correct position to maintain the
	 * order.
	 *
	 * @param {Object} The objects to add to this set.
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.add = function () {
	  var i, element

	  for (i = 0; i < arguments.length; i++) {
	    element = arguments[i]
	    if (~this.indexOf(element)) continue
	    this.elements.splice(this.locationFor(element), 0, element)
	  }

	  this.length = this.elements.length
	}

	/**
	 * Converts this sorted set into an array.
	 *
	 * @returns {Array}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.toArray = function () {
	  return this.elements.slice()
	}

	/**
	 * Creates a new array with the results of calling a provided function on every
	 * element in this sorted set.
	 *
	 * Delegates to Array.prototype.map and has the same signature.
	 *
	 * @param {Function} fn The function that is called on each element of the
	 * set.
	 * @param {Object} ctx An optional object that can be used as the context
	 * for the function fn.
	 * @returns {Array}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.map = function (fn, ctx) {
	  return this.elements.map(fn, ctx)
	}

	/**
	 * Executes a provided function once per sorted set element.
	 *
	 * Delegates to Array.prototype.forEach and has the same signature.
	 *
	 * @param {Function} fn The function that is called on each element of the
	 * set.
	 * @param {Object} ctx An optional object that can be used as the context
	 * @memberOf SortedSet
	 * for the function fn.
	 */
	lunr.SortedSet.prototype.forEach = function (fn, ctx) {
	  return this.elements.forEach(fn, ctx)
	}

	/**
	 * Returns the index at which a given element can be found in the
	 * sorted set, or -1 if it is not present.
	 *
	 * @param {Object} elem The object to locate in the sorted set.
	 * @returns {Number}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.indexOf = function (elem) {
	  var start = 0,
	      end = this.elements.length,
	      sectionLength = end - start,
	      pivot = start + Math.floor(sectionLength / 2),
	      pivotElem = this.elements[pivot]

	  while (sectionLength > 1) {
	    if (pivotElem === elem) return pivot

	    if (pivotElem < elem) start = pivot
	    if (pivotElem > elem) end = pivot

	    sectionLength = end - start
	    pivot = start + Math.floor(sectionLength / 2)
	    pivotElem = this.elements[pivot]
	  }

	  if (pivotElem === elem) return pivot

	  return -1
	}

	/**
	 * Returns the position within the sorted set that an element should be
	 * inserted at to maintain the current order of the set.
	 *
	 * This function assumes that the element to search for does not already exist
	 * in the sorted set.
	 *
	 * @param {Object} elem The elem to find the position for in the set
	 * @returns {Number}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.locationFor = function (elem) {
	  var start = 0,
	      end = this.elements.length,
	      sectionLength = end - start,
	      pivot = start + Math.floor(sectionLength / 2),
	      pivotElem = this.elements[pivot]

	  while (sectionLength > 1) {
	    if (pivotElem < elem) start = pivot
	    if (pivotElem > elem) end = pivot

	    sectionLength = end - start
	    pivot = start + Math.floor(sectionLength / 2)
	    pivotElem = this.elements[pivot]
	  }

	  if (pivotElem > elem) return pivot
	  if (pivotElem < elem) return pivot + 1
	}

	/**
	 * Creates a new lunr.SortedSet that contains the elements in the intersection
	 * of this set and the passed set.
	 *
	 * @param {lunr.SortedSet} otherSet The set to intersect with this set.
	 * @returns {lunr.SortedSet}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.intersect = function (otherSet) {
	  var intersectSet = new lunr.SortedSet,
	      i = 0, j = 0,
	      a_len = this.length, b_len = otherSet.length,
	      a = this.elements, b = otherSet.elements

	  while (true) {
	    if (i > a_len - 1 || j > b_len - 1) break

	    if (a[i] === b[j]) {
	      intersectSet.add(a[i])
	      i++, j++
	      continue
	    }

	    if (a[i] < b[j]) {
	      i++
	      continue
	    }

	    if (a[i] > b[j]) {
	      j++
	      continue
	    }
	  };

	  return intersectSet
	}

	/**
	 * Makes a copy of this set
	 *
	 * @returns {lunr.SortedSet}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.clone = function () {
	  var clone = new lunr.SortedSet

	  clone.elements = this.toArray()
	  clone.length = clone.elements.length

	  return clone
	}

	/**
	 * Creates a new lunr.SortedSet that contains the elements in the union
	 * of this set and the passed set.
	 *
	 * @param {lunr.SortedSet} otherSet The set to union with this set.
	 * @returns {lunr.SortedSet}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.union = function (otherSet) {
	  var longSet, shortSet, unionSet

	  if (this.length >= otherSet.length) {
	    longSet = this, shortSet = otherSet
	  } else {
	    longSet = otherSet, shortSet = this
	  }

	  unionSet = longSet.clone()

	  for(var i = 0, shortSetElements = shortSet.toArray(); i < shortSetElements.length; i++){
	    unionSet.add(shortSetElements[i])
	  }

	  return unionSet
	}

	/**
	 * Returns a representation of the sorted set ready for serialisation.
	 *
	 * @returns {Array}
	 * @memberOf SortedSet
	 */
	lunr.SortedSet.prototype.toJSON = function () {
	  return this.toArray()
	}
	/*!
	 * lunr.Index
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.Index is object that manages a search index.  It contains the indexes
	 * and stores all the tokens and document lookups.  It also provides the main
	 * user facing API for the library.
	 *
	 * @constructor
	 */
	lunr.Index = function () {
	  this._fields = []
	  this._ref = 'id'
	  this.pipeline = new lunr.Pipeline
	  this.documentStore = new lunr.Store
	  this.tokenStore = new lunr.TokenStore
	  this.corpusTokens = new lunr.SortedSet
	  this.eventEmitter =  new lunr.EventEmitter
	  this.tokenizerFn = lunr.tokenizer

	  this._idfCache = {}

	  this.on('add', 'remove', 'update', (function () {
	    this._idfCache = {}
	  }).bind(this))
	}

	/**
	 * Bind a handler to events being emitted by the index.
	 *
	 * The handler can be bound to many events at the same time.
	 *
	 * @param {String} [eventName] The name(s) of events to bind the function to.
	 * @param {Function} fn The serialised set to load.
	 * @memberOf Index
	 */
	lunr.Index.prototype.on = function () {
	  var args = Array.prototype.slice.call(arguments)
	  return this.eventEmitter.addListener.apply(this.eventEmitter, args)
	}

	/**
	 * Removes a handler from an event being emitted by the index.
	 *
	 * @param {String} eventName The name of events to remove the function from.
	 * @param {Function} fn The serialised set to load.
	 * @memberOf Index
	 */
	lunr.Index.prototype.off = function (name, fn) {
	  return this.eventEmitter.removeListener(name, fn)
	}

	/**
	 * Loads a previously serialised index.
	 *
	 * Issues a warning if the index being imported was serialised
	 * by a different version of lunr.
	 *
	 * @param {Object} serialisedData The serialised set to load.
	 * @returns {lunr.Index}
	 * @memberOf Index
	 */
	lunr.Index.load = function (serialisedData) {
	  if (serialisedData.version !== lunr.version) {
	    lunr.utils.warn('version mismatch: current ' + lunr.version + ' importing ' + serialisedData.version)
	  }

	  var idx = new this

	  idx._fields = serialisedData.fields
	  idx._ref = serialisedData.ref

	  idx.tokenizer(lunr.tokenizer.load(serialisedData.tokenizer))
	  idx.documentStore = lunr.Store.load(serialisedData.documentStore)
	  idx.tokenStore = lunr.TokenStore.load(serialisedData.tokenStore)
	  idx.corpusTokens = lunr.SortedSet.load(serialisedData.corpusTokens)
	  idx.pipeline = lunr.Pipeline.load(serialisedData.pipeline)

	  return idx
	}

	/**
	 * Adds a field to the list of fields that will be searchable within documents
	 * in the index.
	 *
	 * An optional boost param can be passed to affect how much tokens in this field
	 * rank in search results, by default the boost value is 1.
	 *
	 * Fields should be added before any documents are added to the index, fields
	 * that are added after documents are added to the index will only apply to new
	 * documents added to the index.
	 *
	 * @param {String} fieldName The name of the field within the document that
	 * should be indexed
	 * @param {Number} boost An optional boost that can be applied to terms in this
	 * field.
	 * @returns {lunr.Index}
	 * @memberOf Index
	 */
	lunr.Index.prototype.field = function (fieldName, opts) {
	  var opts = opts || {},
	      field = { name: fieldName, boost: opts.boost || 1 }

	  this._fields.push(field)
	  return this
	}

	/**
	 * Sets the property used to uniquely identify documents added to the index,
	 * by default this property is 'id'.
	 *
	 * This should only be changed before adding documents to the index, changing
	 * the ref property without resetting the index can lead to unexpected results.
	 *
	 * The value of ref can be of any type but it _must_ be stably comparable and
	 * orderable.
	 *
	 * @param {String} refName The property to use to uniquely identify the
	 * documents in the index.
	 * @param {Boolean} emitEvent Whether to emit add events, defaults to true
	 * @returns {lunr.Index}
	 * @memberOf Index
	 */
	lunr.Index.prototype.ref = function (refName) {
	  this._ref = refName
	  return this
	}

	/**
	 * Sets the tokenizer used for this index.
	 *
	 * By default the index will use the default tokenizer, lunr.tokenizer. The tokenizer
	 * should only be changed before adding documents to the index. Changing the tokenizer
	 * without re-building the index can lead to unexpected results.
	 *
	 * @param {Function} fn The function to use as a tokenizer.
	 * @returns {lunr.Index}
	 * @memberOf Index
	 */
	lunr.Index.prototype.tokenizer = function (fn) {
	  var isRegistered = fn.label && (fn.label in lunr.tokenizer.registeredFunctions)

	  if (!isRegistered) {
	    lunr.utils.warn('Function is not a registered tokenizer. This may cause problems when serialising the index')
	  }

	  this.tokenizerFn = fn
	  return this
	}

	/**
	 * Add a document to the index.
	 *
	 * This is the way new documents enter the index, this function will run the
	 * fields from the document through the index's pipeline and then add it to
	 * the index, it will then show up in search results.
	 *
	 * An 'add' event is emitted with the document that has been added and the index
	 * the document has been added to. This event can be silenced by passing false
	 * as the second argument to add.
	 *
	 * @param {Object} doc The document to add to the index.
	 * @param {Boolean} emitEvent Whether or not to emit events, default true.
	 * @memberOf Index
	 */
	lunr.Index.prototype.add = function (doc, emitEvent) {
	  var docTokens = {},
	      allDocumentTokens = new lunr.SortedSet,
	      docRef = doc[this._ref],
	      emitEvent = emitEvent === undefined ? true : emitEvent

	  this._fields.forEach(function (field) {
	    var fieldTokens = this.pipeline.run(this.tokenizerFn(doc[field.name]))

	    docTokens[field.name] = fieldTokens

	    for (var i = 0; i < fieldTokens.length; i++) {
	      var token = fieldTokens[i]
	      allDocumentTokens.add(token)
	      this.corpusTokens.add(token)
	    }
	  }, this)

	  this.documentStore.set(docRef, allDocumentTokens)

	  for (var i = 0; i < allDocumentTokens.length; i++) {
	    var token = allDocumentTokens.elements[i]
	    var tf = 0;

	    for (var j = 0; j < this._fields.length; j++){
	      var field = this._fields[j]
	      var fieldTokens = docTokens[field.name]
	      var fieldLength = fieldTokens.length

	      if (!fieldLength) continue

	      var tokenCount = 0
	      for (var k = 0; k < fieldLength; k++){
	        if (fieldTokens[k] === token){
	          tokenCount++
	        }
	      }

	      tf += (tokenCount / fieldLength * field.boost)
	    }

	    this.tokenStore.add(token, { ref: docRef, tf: tf })
	  };

	  if (emitEvent) this.eventEmitter.emit('add', doc, this)
	}

	/**
	 * Removes a document from the index.
	 *
	 * To make sure documents no longer show up in search results they can be
	 * removed from the index using this method.
	 *
	 * The document passed only needs to have the same ref property value as the
	 * document that was added to the index, they could be completely different
	 * objects.
	 *
	 * A 'remove' event is emitted with the document that has been removed and the index
	 * the document has been removed from. This event can be silenced by passing false
	 * as the second argument to remove.
	 *
	 * @param {Object} doc The document to remove from the index.
	 * @param {Boolean} emitEvent Whether to emit remove events, defaults to true
	 * @memberOf Index
	 */
	lunr.Index.prototype.remove = function (doc, emitEvent) {
	  var docRef = doc[this._ref],
	      emitEvent = emitEvent === undefined ? true : emitEvent

	  if (!this.documentStore.has(docRef)) return

	  var docTokens = this.documentStore.get(docRef)

	  this.documentStore.remove(docRef)

	  docTokens.forEach(function (token) {
	    this.tokenStore.remove(token, docRef)
	  }, this)

	  if (emitEvent) this.eventEmitter.emit('remove', doc, this)
	}

	/**
	 * Updates a document in the index.
	 *
	 * When a document contained within the index gets updated, fields changed,
	 * added or removed, to make sure it correctly matched against search queries,
	 * it should be updated in the index.
	 *
	 * This method is just a wrapper around `remove` and `add`
	 *
	 * An 'update' event is emitted with the document that has been updated and the index.
	 * This event can be silenced by passing false as the second argument to update. Only
	 * an update event will be fired, the 'add' and 'remove' events of the underlying calls
	 * are silenced.
	 *
	 * @param {Object} doc The document to update in the index.
	 * @param {Boolean} emitEvent Whether to emit update events, defaults to true
	 * @see Index.prototype.remove
	 * @see Index.prototype.add
	 * @memberOf Index
	 */
	lunr.Index.prototype.update = function (doc, emitEvent) {
	  var emitEvent = emitEvent === undefined ? true : emitEvent

	  this.remove(doc, false)
	  this.add(doc, false)

	  if (emitEvent) this.eventEmitter.emit('update', doc, this)
	}

	/**
	 * Calculates the inverse document frequency for a token within the index.
	 *
	 * @param {String} token The token to calculate the idf of.
	 * @see Index.prototype.idf
	 * @private
	 * @memberOf Index
	 */
	lunr.Index.prototype.idf = function (term) {
	  var cacheKey = "@" + term
	  if (Object.prototype.hasOwnProperty.call(this._idfCache, cacheKey)) return this._idfCache[cacheKey]

	  var documentFrequency = this.tokenStore.count(term),
	      idf = 1

	  if (documentFrequency > 0) {
	    idf = 1 + Math.log(this.documentStore.length / documentFrequency)
	  }

	  return this._idfCache[cacheKey] = idf
	}

	/**
	 * Searches the index using the passed query.
	 *
	 * Queries should be a string, multiple words are allowed and will lead to an
	 * AND based query, e.g. `idx.search('foo bar')` will run a search for
	 * documents containing both 'foo' and 'bar'.
	 *
	 * All query tokens are passed through the same pipeline that document tokens
	 * are passed through, so any language processing involved will be run on every
	 * query term.
	 *
	 * Each query term is expanded, so that the term 'he' might be expanded to
	 * 'hello' and 'help' if those terms were already included in the index.
	 *
	 * Matching documents are returned as an array of objects, each object contains
	 * the matching document ref, as set for this index, and the similarity score
	 * for this document against the query.
	 *
	 * @param {String} query The query to search the index with.
	 * @returns {Object}
	 * @see Index.prototype.idf
	 * @see Index.prototype.documentVector
	 * @memberOf Index
	 */
	lunr.Index.prototype.search = function (query) {
	  var queryTokens = this.pipeline.run(this.tokenizerFn(query)),
	      queryVector = new lunr.Vector,
	      documentSets = [],
	      fieldBoosts = this._fields.reduce(function (memo, f) { return memo + f.boost }, 0)

	  var hasSomeToken = queryTokens.some(function (token) {
	    return this.tokenStore.has(token)
	  }, this)

	  if (!hasSomeToken) return []

	  queryTokens
	    .forEach(function (token, i, tokens) {
	      var tf = 1 / tokens.length * this._fields.length * fieldBoosts,
	          self = this

	      var set = this.tokenStore.expand(token).reduce(function (memo, key) {
	        var pos = self.corpusTokens.indexOf(key),
	            idf = self.idf(key),
	            similarityBoost = 1,
	            set = new lunr.SortedSet

	        // if the expanded key is not an exact match to the token then
	        // penalise the score for this key by how different the key is
	        // to the token.
	        if (key !== token) {
	          var diff = Math.max(3, key.length - token.length)
	          similarityBoost = 1 / Math.log(diff)
	        }

	        // calculate the query tf-idf score for this token
	        // applying an similarityBoost to ensure exact matches
	        // these rank higher than expanded terms
	        if (pos > -1) queryVector.insert(pos, tf * idf * similarityBoost)

	        // add all the documents that have this key into a set
	        // ensuring that the type of key is preserved
	        var matchingDocuments = self.tokenStore.get(key),
	            refs = Object.keys(matchingDocuments),
	            refsLen = refs.length

	        for (var i = 0; i < refsLen; i++) {
	          set.add(matchingDocuments[refs[i]].ref)
	        }

	        return memo.union(set)
	      }, new lunr.SortedSet)

	      documentSets.push(set)
	    }, this)

	  var documentSet = documentSets.reduce(function (memo, set) {
	    return memo.intersect(set)
	  })

	  return documentSet
	    .map(function (ref) {
	      return { ref: ref, score: queryVector.similarity(this.documentVector(ref)) }
	    }, this)
	    .sort(function (a, b) {
	      return b.score - a.score
	    })
	}

	/**
	 * Generates a vector containing all the tokens in the document matching the
	 * passed documentRef.
	 *
	 * The vector contains the tf-idf score for each token contained in the
	 * document with the passed documentRef.  The vector will contain an element
	 * for every token in the indexes corpus, if the document does not contain that
	 * token the element will be 0.
	 *
	 * @param {Object} documentRef The ref to find the document with.
	 * @returns {lunr.Vector}
	 * @private
	 * @memberOf Index
	 */
	lunr.Index.prototype.documentVector = function (documentRef) {
	  var documentTokens = this.documentStore.get(documentRef),
	      documentTokensLength = documentTokens.length,
	      documentVector = new lunr.Vector

	  for (var i = 0; i < documentTokensLength; i++) {
	    var token = documentTokens.elements[i],
	        tf = this.tokenStore.get(token)[documentRef].tf,
	        idf = this.idf(token)

	    documentVector.insert(this.corpusTokens.indexOf(token), tf * idf)
	  };

	  return documentVector
	}

	/**
	 * Returns a representation of the index ready for serialisation.
	 *
	 * @returns {Object}
	 * @memberOf Index
	 */
	lunr.Index.prototype.toJSON = function () {
	  return {
	    version: lunr.version,
	    fields: this._fields,
	    ref: this._ref,
	    tokenizer: this.tokenizerFn.label,
	    documentStore: this.documentStore.toJSON(),
	    tokenStore: this.tokenStore.toJSON(),
	    corpusTokens: this.corpusTokens.toJSON(),
	    pipeline: this.pipeline.toJSON()
	  }
	}

	/**
	 * Applies a plugin to the current index.
	 *
	 * A plugin is a function that is called with the index as its context.
	 * Plugins can be used to customise or extend the behaviour the index
	 * in some way. A plugin is just a function, that encapsulated the custom
	 * behaviour that should be applied to the index.
	 *
	 * The plugin function will be called with the index as its argument, additional
	 * arguments can also be passed when calling use. The function will be called
	 * with the index as its context.
	 *
	 * Example:
	 *
	 *     var myPlugin = function (idx, arg1, arg2) {
	 *       // `this` is the index to be extended
	 *       // apply any extensions etc here.
	 *     }
	 *
	 *     var idx = lunr(function () {
	 *       this.use(myPlugin, 'arg1', 'arg2')
	 *     })
	 *
	 * @param {Function} plugin The plugin to apply.
	 * @memberOf Index
	 */
	lunr.Index.prototype.use = function (plugin) {
	  var args = Array.prototype.slice.call(arguments, 1)
	  args.unshift(this)
	  plugin.apply(this, args)
	}
	/*!
	 * lunr.Store
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.Store is a simple key-value store used for storing sets of tokens for
	 * documents stored in index.
	 *
	 * @constructor
	 * @module
	 */
	lunr.Store = function () {
	  this.store = {}
	  this.length = 0
	}

	/**
	 * Loads a previously serialised store
	 *
	 * @param {Object} serialisedData The serialised store to load.
	 * @returns {lunr.Store}
	 * @memberOf Store
	 */
	lunr.Store.load = function (serialisedData) {
	  var store = new this

	  store.length = serialisedData.length
	  store.store = Object.keys(serialisedData.store).reduce(function (memo, key) {
	    memo[key] = lunr.SortedSet.load(serialisedData.store[key])
	    return memo
	  }, {})

	  return store
	}

	/**
	 * Stores the given tokens in the store against the given id.
	 *
	 * @param {Object} id The key used to store the tokens against.
	 * @param {Object} tokens The tokens to store against the key.
	 * @memberOf Store
	 */
	lunr.Store.prototype.set = function (id, tokens) {
	  if (!this.has(id)) this.length++
	  this.store[id] = tokens
	}

	/**
	 * Retrieves the tokens from the store for a given key.
	 *
	 * @param {Object} id The key to lookup and retrieve from the store.
	 * @returns {Object}
	 * @memberOf Store
	 */
	lunr.Store.prototype.get = function (id) {
	  return this.store[id]
	}

	/**
	 * Checks whether the store contains a key.
	 *
	 * @param {Object} id The id to look up in the store.
	 * @returns {Boolean}
	 * @memberOf Store
	 */
	lunr.Store.prototype.has = function (id) {
	  return id in this.store
	}

	/**
	 * Removes the value for a key in the store.
	 *
	 * @param {Object} id The id to remove from the store.
	 * @memberOf Store
	 */
	lunr.Store.prototype.remove = function (id) {
	  if (!this.has(id)) return

	  delete this.store[id]
	  this.length--
	}

	/**
	 * Returns a representation of the store ready for serialisation.
	 *
	 * @returns {Object}
	 * @memberOf Store
	 */
	lunr.Store.prototype.toJSON = function () {
	  return {
	    store: this.store,
	    length: this.length
	  }
	}

	/*!
	 * lunr.stemmer
	 * Copyright (C) 2016 Oliver Nightingale
	 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
	 */

	/**
	 * lunr.stemmer is an english language stemmer, this is a JavaScript
	 * implementation of the PorterStemmer taken from http://tartarus.org/~martin
	 *
	 * @module
	 * @param {String} str The string to stem
	 * @returns {String}
	 * @see lunr.Pipeline
	 */
	lunr.stemmer = (function(){
	  var step2list = {
	      "ational" : "ate",
	      "tional" : "tion",
	      "enci" : "ence",
	      "anci" : "ance",
	      "izer" : "ize",
	      "bli" : "ble",
	      "alli" : "al",
	      "entli" : "ent",
	      "eli" : "e",
	      "ousli" : "ous",
	      "ization" : "ize",
	      "ation" : "ate",
	      "ator" : "ate",
	      "alism" : "al",
	      "iveness" : "ive",
	      "fulness" : "ful",
	      "ousness" : "ous",
	      "aliti" : "al",
	      "iviti" : "ive",
	      "biliti" : "ble",
	      "logi" : "log"
	    },

	    step3list = {
	      "icate" : "ic",
	      "ative" : "",
	      "alize" : "al",
	      "iciti" : "ic",
	      "ical" : "ic",
	      "ful" : "",
	      "ness" : ""
	    },

	    c = "[^aeiou]",          // consonant
	    v = "[aeiouy]",          // vowel
	    C = c + "[^aeiouy]*",    // consonant sequence
	    V = v + "[aeiou]*",      // vowel sequence

	    mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
	    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
	    mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
	    s_v = "^(" + C + ")?" + v;                   // vowel in stem

	  var re_mgr0 = new RegExp(mgr0);
	  var re_mgr1 = new RegExp(mgr1);
	  var re_meq1 = new RegExp(meq1);
	  var re_s_v = new RegExp(s_v);

	  var re_1a = /^(.+?)(ss|i)es$/;
	  var re2_1a = /^(.+?)([^s])s$/;
	  var re_1b = /^(.+?)eed$/;
	  var re2_1b = /^(.+?)(ed|ing)$/;
	  var re_1b_2 = /.$/;
	  var re2_1b_2 = /(at|bl|iz)$/;
	  var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
	  var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

	  var re_1c = /^(.+?[^aeiou])y$/;
	  var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

	  var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

	  var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
	  var re2_4 = /^(.+?)(s|t)(ion)$/;

	  var re_5 = /^(.+?)e$/;
	  var re_5_1 = /ll$/;
	  var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

	  var porterStemmer = function porterStemmer(w) {
	    var   stem,
	      suffix,
	      firstch,
	      re,
	      re2,
	      re3,
	      re4;

	    if (w.length < 3) { return w; }

	    firstch = w.substr(0,1);
	    if (firstch == "y") {
	      w = firstch.toUpperCase() + w.substr(1);
	    }

	    // Step 1a
	    re = re_1a
	    re2 = re2_1a;

	    if (re.test(w)) { w = w.replace(re,"$1$2"); }
	    else if (re2.test(w)) { w = w.replace(re2,"$1$2"); }

	    // Step 1b
	    re = re_1b;
	    re2 = re2_1b;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      re = re_mgr0;
	      if (re.test(fp[1])) {
	        re = re_1b_2;
	        w = w.replace(re,"");
	      }
	    } else if (re2.test(w)) {
	      var fp = re2.exec(w);
	      stem = fp[1];
	      re2 = re_s_v;
	      if (re2.test(stem)) {
	        w = stem;
	        re2 = re2_1b_2;
	        re3 = re3_1b_2;
	        re4 = re4_1b_2;
	        if (re2.test(w)) {  w = w + "e"; }
	        else if (re3.test(w)) { re = re_1b_2; w = w.replace(re,""); }
	        else if (re4.test(w)) { w = w + "e"; }
	      }
	    }

	    // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
	    re = re_1c;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      stem = fp[1];
	      w = stem + "i";
	    }

	    // Step 2
	    re = re_2;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      stem = fp[1];
	      suffix = fp[2];
	      re = re_mgr0;
	      if (re.test(stem)) {
	        w = stem + step2list[suffix];
	      }
	    }

	    // Step 3
	    re = re_3;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      stem = fp[1];
	      suffix = fp[2];
	      re = re_mgr0;
	      if (re.test(stem)) {
	        w = stem + step3list[suffix];
	      }
	    }

	    // Step 4
	    re = re_4;
	    re2 = re2_4;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      stem = fp[1];
	      re = re_mgr1;
	      if (re.test(stem)) {
	        w = stem;
	      }
	    } else if (re2.test(w)) {
	      var fp = re2.exec(w);
	      stem = fp[1] + fp[2];
	      re2 = re_mgr1;
	      if (re2.test(stem)) {
	        w = stem;
	      }
	    }

	    // Step 5
	    re = re_5;
	    if (re.test(w)) {
	      var fp = re.exec(w);
	      stem = fp[1];
	      re = re_mgr1;
	      re2 = re_meq1;
	      re3 = re3_5;
	      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
	        w = stem;
	      }
	    }

	    re = re_5_1;
	    re2 = re_mgr1;
	    if (re.test(w) && re2.test(w)) {
	      re = re_1b_2;
	      w = w.replace(re,"");
	    }

	    // and turn initial Y back to y

	    if (firstch == "y") {
	      w = firstch.toLowerCase() + w.substr(1);
	    }

	    return w;
	  };

	  return porterStemmer;
	})();

	lunr.Pipeline.registerFunction(lunr.stemmer, 'stemmer')
	/*!
	 * lunr.stopWordFilter
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.generateStopWordFilter builds a stopWordFilter function from the provided
	 * list of stop words.
	 *
	 * The built in lunr.stopWordFilter is built using this generator and can be used
	 * to generate custom stopWordFilters for applications or non English languages.
	 *
	 * @module
	 * @param {Array} token The token to pass through the filter
	 * @returns {Function}
	 * @see lunr.Pipeline
	 * @see lunr.stopWordFilter
	 */
	lunr.generateStopWordFilter = function (stopWords) {
	  var words = stopWords.reduce(function (memo, stopWord) {
	    memo[stopWord] = stopWord
	    return memo
	  }, {})

	  return function (token) {
	    if (token && words[token] !== token) return token
	  }
	}

	/**
	 * lunr.stopWordFilter is an English language stop word list filter, any words
	 * contained in the list will not be passed through the filter.
	 *
	 * This is intended to be used in the Pipeline. If the token does not pass the
	 * filter then undefined will be returned.
	 *
	 * @module
	 * @param {String} token The token to pass through the filter
	 * @returns {String}
	 * @see lunr.Pipeline
	 */
	lunr.stopWordFilter = lunr.generateStopWordFilter([
	  'a',
	  'able',
	  'about',
	  'across',
	  'after',
	  'all',
	  'almost',
	  'also',
	  'am',
	  'among',
	  'an',
	  'and',
	  'any',
	  'are',
	  'as',
	  'at',
	  'be',
	  'because',
	  'been',
	  'but',
	  'by',
	  'can',
	  'cannot',
	  'could',
	  'dear',
	  'did',
	  'do',
	  'does',
	  'either',
	  'else',
	  'ever',
	  'every',
	  'for',
	  'from',
	  'get',
	  'got',
	  'had',
	  'has',
	  'have',
	  'he',
	  'her',
	  'hers',
	  'him',
	  'his',
	  'how',
	  'however',
	  'i',
	  'if',
	  'in',
	  'into',
	  'is',
	  'it',
	  'its',
	  'just',
	  'least',
	  'let',
	  'like',
	  'likely',
	  'may',
	  'me',
	  'might',
	  'most',
	  'must',
	  'my',
	  'neither',
	  'no',
	  'nor',
	  'not',
	  'of',
	  'off',
	  'often',
	  'on',
	  'only',
	  'or',
	  'other',
	  'our',
	  'own',
	  'rather',
	  'said',
	  'say',
	  'says',
	  'she',
	  'should',
	  'since',
	  'so',
	  'some',
	  'than',
	  'that',
	  'the',
	  'their',
	  'them',
	  'then',
	  'there',
	  'these',
	  'they',
	  'this',
	  'tis',
	  'to',
	  'too',
	  'twas',
	  'us',
	  'wants',
	  'was',
	  'we',
	  'were',
	  'what',
	  'when',
	  'where',
	  'which',
	  'while',
	  'who',
	  'whom',
	  'why',
	  'will',
	  'with',
	  'would',
	  'yet',
	  'you',
	  'your'
	])

	lunr.Pipeline.registerFunction(lunr.stopWordFilter, 'stopWordFilter')
	/*!
	 * lunr.trimmer
	 * Copyright (C) 2016 Oliver Nightingale
	 */

	/**
	 * lunr.trimmer is a pipeline function for trimming non word
	 * characters from the begining and end of tokens before they
	 * enter the index.
	 *
	 * This implementation may not work correctly for non latin
	 * characters and should either be removed or adapted for use
	 * with languages with non-latin characters.
	 *
	 * @module
	 * @param {String} token The token to pass through the filter
	 * @returns {String}
	 * @see lunr.Pipeline
	 */
	lunr.trimmer = function (token) {
	  return token.replace(/^\W+/, '').replace(/\W+$/, '')
	}

	lunr.Pipeline.registerFunction(lunr.trimmer, 'trimmer')
	/*!
	 * lunr.stemmer
	 * Copyright (C) 2016 Oliver Nightingale
	 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
	 */

	/**
	 * lunr.TokenStore is used for efficient storing and lookup of the reverse
	 * index of token to document ref.
	 *
	 * @constructor
	 */
	lunr.TokenStore = function () {
	  this.root = { docs: {} }
	  this.length = 0
	}

	/**
	 * Loads a previously serialised token store
	 *
	 * @param {Object} serialisedData The serialised token store to load.
	 * @returns {lunr.TokenStore}
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.load = function (serialisedData) {
	  var store = new this

	  store.root = serialisedData.root
	  store.length = serialisedData.length

	  return store
	}

	/**
	 * Adds a new token doc pair to the store.
	 *
	 * By default this function starts at the root of the current store, however
	 * it can start at any node of any token store if required.
	 *
	 * @param {String} token The token to store the doc under
	 * @param {Object} doc The doc to store against the token
	 * @param {Object} root An optional node at which to start looking for the
	 * correct place to enter the doc, by default the root of this lunr.TokenStore
	 * is used.
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.add = function (token, doc, root) {
	  var root = root || this.root,
	      key = token.charAt(0),
	      rest = token.slice(1)

	  if (!(key in root)) root[key] = {docs: {}}

	  if (rest.length === 0) {
	    root[key].docs[doc.ref] = doc
	    this.length += 1
	    return
	  } else {
	    return this.add(rest, doc, root[key])
	  }
	}

	/**
	 * Checks whether this key is contained within this lunr.TokenStore.
	 *
	 * By default this function starts at the root of the current store, however
	 * it can start at any node of any token store if required.
	 *
	 * @param {String} token The token to check for
	 * @param {Object} root An optional node at which to start
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.has = function (token) {
	  if (!token) return false

	  var node = this.root

	  for (var i = 0; i < token.length; i++) {
	    if (!node[token.charAt(i)]) return false

	    node = node[token.charAt(i)]
	  }

	  return true
	}

	/**
	 * Retrieve a node from the token store for a given token.
	 *
	 * By default this function starts at the root of the current store, however
	 * it can start at any node of any token store if required.
	 *
	 * @param {String} token The token to get the node for.
	 * @param {Object} root An optional node at which to start.
	 * @returns {Object}
	 * @see TokenStore.prototype.get
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.getNode = function (token) {
	  if (!token) return {}

	  var node = this.root

	  for (var i = 0; i < token.length; i++) {
	    if (!node[token.charAt(i)]) return {}

	    node = node[token.charAt(i)]
	  }

	  return node
	}

	/**
	 * Retrieve the documents for a node for the given token.
	 *
	 * By default this function starts at the root of the current store, however
	 * it can start at any node of any token store if required.
	 *
	 * @param {String} token The token to get the documents for.
	 * @param {Object} root An optional node at which to start.
	 * @returns {Object}
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.get = function (token, root) {
	  return this.getNode(token, root).docs || {}
	}

	lunr.TokenStore.prototype.count = function (token, root) {
	  return Object.keys(this.get(token, root)).length
	}

	/**
	 * Remove the document identified by ref from the token in the store.
	 *
	 * By default this function starts at the root of the current store, however
	 * it can start at any node of any token store if required.
	 *
	 * @param {String} token The token to get the documents for.
	 * @param {String} ref The ref of the document to remove from this token.
	 * @param {Object} root An optional node at which to start.
	 * @returns {Object}
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.remove = function (token, ref) {
	  if (!token) return
	  var node = this.root

	  for (var i = 0; i < token.length; i++) {
	    if (!(token.charAt(i) in node)) return
	    node = node[token.charAt(i)]
	  }

	  delete node.docs[ref]
	}

	/**
	 * Find all the possible suffixes of the passed token using tokens
	 * currently in the store.
	 *
	 * @param {String} token The token to expand.
	 * @returns {Array}
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.expand = function (token, memo) {
	  var root = this.getNode(token),
	      docs = root.docs || {},
	      memo = memo || []

	  if (Object.keys(docs).length) memo.push(token)

	  Object.keys(root)
	    .forEach(function (key) {
	      if (key === 'docs') return

	      memo.concat(this.expand(token + key, memo))
	    }, this)

	  return memo
	}

	/**
	 * Returns a representation of the token store ready for serialisation.
	 *
	 * @returns {Object}
	 * @memberOf TokenStore
	 */
	lunr.TokenStore.prototype.toJSON = function () {
	  return {
	    root: this.root,
	    length: this.length
	  }
	}

	  /**
	   * export the module via AMD, CommonJS or as a browser global
	   * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
	   */
	  ;(function (root, factory) {
	    if (true) {
	      // AMD. Register as an anonymous module.
	      !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	    } else if (typeof exports === 'object') {
	      /**
	       * Node. Does not work with strict CommonJS, but
	       * only CommonJS-like enviroments that support module.exports,
	       * like Node.
	       */
	      module.exports = factory()
	    } else {
	      // Browser globals (root is window)
	      root.lunr = factory()
	    }
	  }(this, function () {
	    /**
	     * Just return a value to define the module export.
	     * This example returns an object, but the module
	     * can return a function as the exported value.
	     */
	    return lunr
	  }))
	})();


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * jQuery Highlight plugin
	 *
	 * Based on highlight v3 by Johann Burkard
	 * http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
	 *
	 * Code a little bit refactored and cleaned (in my humble opinion).
	 * Most important changes:
	 *  - has an option to highlight only entire words (wordsOnly - false by default),
	 *  - has an option to be case sensitive (caseSensitive - false by default)
	 *  - highlight element tag and class names can be specified in options
	 *
	 * Usage:
	 *   // wrap every occurrance of text 'lorem' in content
	 *   // with <span class='highlight'> (default options)
	 *   $('#content').highlight('lorem');
	 *
	 *   // search for and highlight more terms at once
	 *   // so you can save some time on traversing DOM
	 *   $('#content').highlight(['lorem', 'ipsum']);
	 *   $('#content').highlight('lorem ipsum');
	 *
	 *   // search only for entire word 'lorem'
	 *   $('#content').highlight('lorem', { wordsOnly: true });
	 *
	 *   // search only for the entire word 'C#'
	 *   // and make sure that the word boundary can also
	 *   // be a 'non-word' character, as well as a regex latin1 only boundary:
	 *   $('#content').highlight('C#', { wordsOnly: true , wordsBoundary: '[\\b\\W]' });
	 *
	 *   // don't ignore case during search of term 'lorem'
	 *   $('#content').highlight('lorem', { caseSensitive: true });
	 *
	 *   // wrap every occurrance of term 'ipsum' in content
	 *   // with <em class='important'>
	 *   $('#content').highlight('ipsum', { element: 'em', className: 'important' });
	 *
	 *   // remove default highlight
	 *   $('#content').unhighlight();
	 *
	 *   // remove custom highlight
	 *   $('#content').unhighlight({ element: 'em', className: 'important' });
	 *
	 *
	 * Copyright (c) 2009 Bartek Szopka
	 *
	 * Licensed under MIT license.
	 *
	 */

	(function (factory) {
	    if (true) {
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // Node/CommonJS
	        factory(require('jquery'));
	    } else {
	        // Browser globals
	        factory(jQuery);
	    }
	}(function (jQuery) {
	    jQuery.extend({
	        highlight: function (node, re, nodeName, className) {
	            if (node.nodeType === 3) {
	                var match = node.data.match(re);
	                if (match) {
	                    // The new highlight Element Node
	                    var highlight = document.createElement(nodeName || 'span');
	                    highlight.className = className || 'highlight';
	                    // Note that we use the captured value to find the real index
	                    // of the match. This is because we do not want to include the matching word boundaries
	                    var capturePos = node.data.indexOf( match[1] , match.index );

	                    // Split the node and replace the matching wordnode
	                    // with the highlighted node
	                    var wordNode = node.splitText(capturePos);
	                    wordNode.splitText(match[1].length);

	                    var wordClone = wordNode.cloneNode(true);                    
	                    highlight.appendChild(wordClone);
	                    wordNode.parentNode.replaceChild(highlight, wordNode);
	                    return 1; //skip added node in parent
	                }
	            } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
	                    !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
	                    !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
	                for (var i = 0; i < node.childNodes.length; i++) {
	                    i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
	                }
	            }
	            return 0;
	        }
	    });

	    jQuery.fn.unhighlight = function (options) {
	        var settings = {
	          className: 'highlight',
	          element: 'span'
	        };

	        jQuery.extend(settings, options);

	        return this.find(settings.element + '.' + settings.className).each(function () {
	            var parent = this.parentNode;
	            parent.replaceChild(this.firstChild, this);
	            parent.normalize();
	        }).end();
	    };

	    jQuery.fn.highlight = function (words, options) {
	        var settings = {
	          className: 'highlight',
	          element: 'span',
	          caseSensitive: false,
	          wordsOnly: false,
	          wordsBoundary: '\\b'
	        };

	        jQuery.extend(settings, options);
	        
	        if (typeof words === 'string') {
	          words = [words];
	        }
	        words = jQuery.grep(words, function(word, i){
	          return word != '';
	        });
	        words = jQuery.map(words, function(word, i) {
	          return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	        });

	        if (words.length === 0) {
	          return this;
	        };

	        var flag = settings.caseSensitive ? '' : 'i';
	        // The capture parenthesis will make sure we can match
	        // only the matching word
	        var pattern = '(' + words.join('|') + ')';
	        if (settings.wordsOnly) {
	            pattern = settings.wordsBoundary + pattern + settings.wordsBoundary;
	        }
	        var re = new RegExp(pattern, flag);
	        
	        return this.each(function () {
	            jQuery.highlight(this, re, settings.element, settings.className);
	        });
	    };
	}));


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Project = function () {
	  function Project(directory, name, clientUUID) {
	    _classCallCheck(this, Project);

	    this.directory = directory;
	    this.name = name;
	    this.clientUUID = clientUUID;
	    this.connect();
	  }

	  _createClass(Project, [{
	    key: 'connect',
	    value: function connect() {
	      var _this = this;

	      this.ws = new WebSocket('ws://localhost:3001/sockets/projects/' + this.directory + '/' + this.name + '/' + this.clientUUID);
	      this.ws.onopen = function (e) {
	        var messageData = {
	          typ: "notification",
	          text: "client registering"
	        };
	        _this.ws.send(JSON.stringify(messageData));
	      };
	    }
	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      this.ws.close();
	    }
	  }, {
	    key: 'listen',
	    value: function listen() {
	      var _this2 = this;

	      console.log("Listening for changes...");

	      this.ws.addEventListener("message", function (e) {
	        var message = JSON.parse(e.data);
	        // console.log(message);
	        if (message.typ == "update") {
	          location.reload();
	        }
	      });

	      this.ws.addEventListener("close", function (e) {
	        console.log("Connection closed, attempting to reconnect...", e);
	        _this2.connect();
	      });

	      this.ws.addEventListener("error", function (e) {
	        console.warn("Connection encountered an error", e);
	      });
	    }
	  }]);

	  return Project;
	}();

	exports.default = Project;

/***/ }
/******/ ]);