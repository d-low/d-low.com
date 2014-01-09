/**
 * @description The home object defines the behavior for the home page of the site.
 */
window.dlow.home = {

  /**
   * Element handles and data
   */

  $siteHeader: null,
  $siteHeaderLogo: null,
  $contentsSection: null,

  heights: {
    siteHeader: 0,
    siteHeaderLogo: 0
  },

  resize_timeout: null,

  /**
   * @description Initialize home page specific events.
   */
  initialize: function() {

    //
    // Get element handles
    //

    this.$siteHeader = $(".site-header");
    this.$siteHeaderLogo = $(".site-header-logo");
    this.$contentsSection = $("#contents-section");
  
    //
    // Update sizing, get heights, and set header opacity
    //

    this.setHeights();
    this.getHeights();
    this.updateSiteHeaderLogoOpacity();

    // 
    // Event handlers
    //
    
    $(window).resize($.proxy(this.window_resize, this));
    $(window).scroll($.proxy(this.window_scroll, this));

    if (! dlow.isMobile()) {
      $(".js-contents-navigation-item")
        .bind("mouseover", $.proxy(this.navigationItem_mouseover, this));
    }
  },


  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * @description Upon the last window resize event firing we'll set our intro
   * container height, update our heights, and then the navigation positioning.
   */
  window_resize: function() { 
    var self = this;

    var fResize = function() { 
      self.setHeights();
      self.getHeights();
    };  

    window.clearTimeout(this.resize_timeout);
    this.resize_timeout = window.setTimeout(fResize, 100);
  },

  /**
   * @description Handle the onscroll events to liven up the home page.
   */
  window_scroll: function() { 
    if (this.isSiteHeaderVisible()) {
      this.updateSiteHeaderBackground();
      this.updateSiteHeaderLogoOpacity();
    }
  },


  // --------------------------------------------------------------------------
  // Positioning Methods
  // --------------------------------------------------------------------------

  /**
   * @description Get the heights of our primary elements.
   */
  getHeights: function() {
    this.heights.siteHeader = this.$siteHeader.height();
    this.heights.siteHeaderLogo = this.$siteHeaderLogo.height();
    this.heights.contentsSection = this.$contentsSection.height();
  },

  /**
   * @description Set the height of the welcome and content sections to be the 
   * height of the view port so that the background image on the intro 
   * container, and perhaps others, covers the viewport properly.  This method 
   * will be called after the last window resize event.
   */
  setHeights: function() { 
    var height = $(window).height();

    this.$siteHeader.css("height", height + "px");

    if (! dlow.isMobile()) {
      this.$contentsSection.css("height", height + "px");
    }
  },

  /**
   * @description The site header is visible when the window's scroll top is 
   * less than or equal to the height of the site header.
   */
  isSiteHeaderVisible: function() { 
   return $(window).scrollTop() <= this.heights.siteHeader;
  },


  // --------------------------------------------------------------------------
  // Effects Methods
  // --------------------------------------------------------------------------

  /**
   * @description Update the background position of the site header so that its 
   * contents scroll away faster than the background image.  This is a simple 
   * parallax scrolling technique.
   */
  updateSiteHeaderBackground: function() { 
    var scrollTop = $(window).scrollTop();
    var yPos = -(scrollTop / 10);
    var coords = '50% '+ yPos + 'px';

    this.$siteHeader.css({"background-position": coords });
  },

  /**
   * @description Update the opacity of the intro header as we scroll down the 
   * page so that it fades away as the intro container is scrolled out of view.
   */
  updateSiteHeaderLogoOpacity: function() { 

    var scrollTop = $(window).scrollTop();
    var scrollRange = this.heights.siteHeader - this.heights.siteHeaderLogo;
    var opacity = Number((100 - (scrollTop / scrollRange * 100)) / 100).toFixed(2);

    opacity = opacity < 0 ? 0 : opacity;

    this.$siteHeaderLogo.css("opacity", opacity);

    // The header needs to be hidden (dislay: none) when it is no longer 
    // visible, meaning content below it has been scrolled into view, so that 
    // it doesn't sit on top of now visible content preventing the user from 
    // interacting with it.

    if (opacity == 0) {
      this.$siteHeaderLogo.addClass("hidden");
    }
    else {
      this.$siteHeaderLogo.removeClass("hidden");
    }
  },

  /**
   * @description Because we can't smoothly transition the z-index we clone
   * the focused element with an opacity of 0 and a z-index greater than all
   * the other elements, and then transition the opacity to 1 so it gracefully
   * rises above the other navigation items.
   * @see: http://zomigi.com/blog/css3-transitions-and-z-index/
   * TODO: This isn't 100% perfect, random cloned elements sometimes get left
   * in the DOM.  The events that lead to this hapening are not yet understood.
   */
  navigationItem_mouseover: function(e) {

    //
    // Clone the navigation item element and insert it after the one that was
    // moused over.
    //

    var $navigationItem = $(e.target).closest(".js-contents-navigation-item");
    var $navigationItemFocused = $navigationItem.clone().addClass("fade-out");

    $navigationItem.after($navigationItemFocused);

    //
    // Transition end event handler:
    //
    // 1) If the focused navigation element has the fade up class then it has
    // been faded in and we'll bind the mouseout handler.
    // 2) If the foucused navigation element does NOT have the fade up class 
    // then we unbind our event handlers and remove it, it is no longer visible.  
    //

    var fTransitionEnd = function() { 
      if ($navigationItemFocused.hasClass("js-fade-up")) {
        console.log("faded in");

        $navigationItemFocused.on("mouseout", fMouseOut);
      }
      else {
        console.log("faded out");

        $navigationItemFocused
          .off("mouseout")
          .off("transitionend webkitTransitionEnd oTransitionEnd otransitionend")
          .remove();
      } 
    };

    //
    // Remove the fade up class when the foucused navigation element is faded 
    // out being sure to cancel the event completely since it may occur 
    // multiple times on child elements.
    //

    var fMouseOut = function(e) { 
      e.preventDefault();
      e.stopImmediatePropagation();

      console.log("mouseout");

      $navigationItemFocused.removeClass("fade-up js-fade-up");
    };

    //
    // Set up the event handlers and add the fade up class to fade in the cloned
    // element.
    // 

    window.setTimeout(function() {
      $navigationItemFocused
        .on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
            fTransitionEnd)
        .addClass("fade-up js-fade-up");
    }, 100);
  }
};