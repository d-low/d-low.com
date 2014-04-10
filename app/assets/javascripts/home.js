/**
 * @description The home object defines the behavior for the home page of the 
 * site.
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
    this.showBackgroundImages();

    // 
    // Event handlers
    //
    
    $(window).resize($.proxy(this.window_resize, this));

    if (dlow.isDesktop()) {
      // Parallax scrolling is only available in desktop (for now?)
      $(window).scroll($.proxy(this.window_scroll, this));
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
   * @description The background images for the site header and contents
   * section are large.  So we fade them in once they've loaded by 
   * transitioning the opacity of generated content inserted after each element
   * from 1 to 0, thus allowing the background images to appear.
   * @see http://stackoverflow.com/questions/5057990/how-can-i-check-if-a-background-image-is-loaded
   */
  showBackgroundImages: function() { 

    if (! dlow.isDesktop()) {
      return;
    }

    var fShowBackground = function($el) {
      var src = $el.css("background-image");
      src = src.replace(/(^url\()|(\)$|[\"\'])/g, '');

      $('<img>').attr('src', src).imagesLoaded(function() {
        $el.addClass("show-background-image");
      });
    };

    fShowBackground(this.$siteHeader);
    fShowBackground(this.$contentsSection);
  }
};