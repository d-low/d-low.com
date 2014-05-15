window.dlow = {

  resizeTimeout: null,

  _isMobile: undefined,
  _isTablet: undefined,
  _isDesktop: undefined,
  _isDesktopLarge: undefined,
  _isIOS: undefined,
  _isAndroid: undefined,

  initialize: function() {
    
    //
    // Initialize site wide common functionality
    //

    if (this.isMobile()) {
      $("body")
        .on("touchstart", ".button", $.proxy(this.el_touchStart, this))
        .on("touchend", ".button", $.proxy(this.el_touchEnd, this))
        .on("touchcancel", ".button", $.proxy(this.el_touchCancel, this));
    }

    this.lazyLoadImages();

    $(window).on("resize", $.proxy(this.window_resize, this));

    // 
    // Initialize page specific functionality
    //

    this.initializePage();
  },

  /**
   * @description Initialize page specific JavaScript.  We're using the garber-irish 
   * technique to invoke page specific JavaScript using data attributes on the body
   * element. 
   * @see http://viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution
   */
  initializePage: function() {

    var $body = $("body");
    var controller = $body.data("controllername");
    var action = $body.data("controlleraction");

    if (this[controller]) {
      if (typeof(this[controller].initialize) === "function") {
        this[controller].initialize();
      }

      if (typeof(this[controller][action]) === "function") {
        this[controller][action]();
      }
    }
  },


  // --------------------------------------------------------------------------
  // Common Mobile Event Handling Methods
  // --------------------------------------------------------------------------

  /**
   * @description Add the tapped class to the element when the touchstart event 
   * fires so that our CSS can reverse the gradient (if required).
   */
  el_touchStart: function(e) {
    $(e.target).closest(".button").addClass("tapped");
  },

  /**
   * @description Remove the tapped class from the element when the touchend 
   * event fires so that our CSS can change back to the normal gradient.
   */
  el_touchEnd: function(e) {
    $(e.target).closest(".button").removeClass("tapped");
  },

  /**
   * @description Remove the tapped class from the element when the touchcancel
   * event fires so that our CSS can change back to the normal gradient.
   */
  el_touchCancel: function(e) { 
    $(e.target).closest(".button").removeClass("tapped");
  },

  /**
   * @description Initialize lazy loader plugin for images.  Some images need to 
   * be loaded immediately.  Others will be loaded when scrolled into view.  And
   * some others are not loaded on mobile devices.
   */
  lazyLoadImages: function() {
    
    var immediateImages = $("img.js-lazy-load-immediate");

    if (this.isMobile()) {
      immediateImages = immediateImages.not(".js-lazy-load-except-mobile");
    }

    immediateImages.lazyload({ 
      effect: "fadeIn",
      event: "lazyload" 
    });

    window.setTimeout(function() { immediateImages.trigger("lazyload"); }, 1000); 

    // TBD: Apply plug-in to load other images when scrolled into view.
  },

  /**
   * @description Set timeouts to handle the last resize event.
   * TODO: We should probably use the debounced resize plug-in now.
   */
  window_resize: function() { 
    window.clearTimeout(this.resizeTimeout);

    this.resizeTimeout = window.setTimeout(
      $.proxy(this.handleWindowResize, this), 
      150
    );
  },

  /**
   * @description Upon the final resize firing reset all of our media member 
   * variables so that we don't accidentally cache the wrong value after a
   * resize.
   */
  handleWindowResize: function() { 
    this._isMobile = undefined;
    this._isTablet = undefined;
    this._isDesktop = undefined;
    this._isDesktopLarge = undefined;
  },
  

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  /**
   * @description Query hidden generated content to check Bootstrap breakpoints
   * in client side script.
   * @see: https://coderwall.com/p/_ldtkg
   */
  isMobile: function() { 

    if (typeof(this._isMobile) === "undefined") {
      this._isMobile = window.getComputedStyle(document.body,':after')
        .getPropertyValue('content')
        .indexOf("mobile") != -1;
    }

    return this._isMobile;
  },

  isTablet: function() { 

    if (typeof(this._isTablet) === "undefined") {
      this._isTablet =  window.getComputedStyle(document.body,':after')
        .getPropertyValue('content')
        .indexOf("tablet") != -1;
    }

    return this._isTablet;
  },

  isDesktop: function() { 

    if (typeof(this._isDesktop) == "undefined") {
      this._isDesktop = window.getComputedStyle(document.body,':after')
        .getPropertyValue('content')
        .indexOf("desktop") != -1;
    }

    return this._isDesktop;
  },

  isDesktopLarge: function() { 

    if (typeof(this._isDesktopLarge) == "undefined") {
      this._isDesktopLarge = window.getComputedStyle(document.body,':after')
        .getPropertyValue('content')
        .indexOf("desktop-large") != -1;
    }

    return this._isDesktopLarge;
  },

  isIOS: function() { 
    if (typeof(this._isIOS) == "undefined") {
      this._isIOS = $("body").hasClass("ios");
    }

    return  this._isIOS;
  },

  isAndroid: function() { 
    if (typeof(this._isAndroid) == "undefined") {
      this._isAndroid = $("body").hasClass("android");
    }

    return  this._isAndroid;
  },  


  // --------------------------------------------------------------------------
  // Effects 
  // --------------------------------------------------------------------------

  /** 
   * @description Animate scrolling up to the requested position and when done 
   * invoke the callback function if one was specified.
   * @param scrollUpTo The y coordinate that we have been requested to scroll
   * up to.
   * @param fCallback An optional callback function to invoke when done 
   * scrolling.
   */
  scrollUpTo: function(scrollUpTo, fCallback) {

    var fScrollUpTo = function() { 
      var scrollTop = $(window).scrollTop();

      if (scrollTop > scrollUpTo) {
        scrollTop -= 10; 
        scrollTop = (scrollTop < 0 ? 0 : scrollTop);

        window.scrollTo(0, scrollTop);
        window.setTimeout(fScrollUpTo, 5); 
      }   
      else {
        if (typeof(fCallback) === "function") {
          fCallback();
        }   
      }   
    };  

    fScrollUpTo();
  } 
};

/**
 * @description The site wide document ready method intitializes the dlow 
 * object which is responsible for setting up all behavior for pages.  There 
 * will be NO other document.ready event handers in page specific JavaScript.
 */
$(document).ready(function() {
  dlow.initialize();
});