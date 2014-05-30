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
    siteHeaderLogo: 0,
    contentsSection: 0,
    contentsSectionOffsetTop: 0
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
    this.showContentNavigationImages();
    this.showBackgroundImages();

    // 
    // Event handlers
    //
    
    $(window).resize($.proxy(this.window_resize, this));

    if (! dlow.isMobile()) {
      // Parallax scrolling is only available in desktop (for now?)
      $(window).on("scroll", $.proxy(this.window_scroll, this));
    }
    else {
      $(window).off("scroll");
    }
  },


  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * @description Upon the last window resize event firing call our initialize
   * method to set the heights, events, etc, again.  
   */
  window_resize: function() { 
    window.clearTimeout(this.resize_timeout);
    this.resize_timeout = window.setTimeout($.proxy(this.initialize, this), 100);
  },

  /**
   * @description Handle the onscroll events to liven up the home page.
   */
  window_scroll: function() { 
    if (this.isSiteHeaderVisible()) {
      this.updateSiteHeaderBackground();
      this.updateSiteHeaderLogoOpacity();
    }
    if (this.isContentsSectionVisible()) {
      this.scaleInContentNavImages();
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
    this.heights.contentsSectionOffsetTop = this.$contentsSection.offset().top;
  },

  /**
   * @description Set the height of the welcome and content sections to be the 
   * height of the view port so that the background image on the intro 
   * container, and perhaps others, covers the viewport properly.  This method 
   * will be called after the last window resize event.  We use 100vh to set
   * the height of these elements where supported.  We resort to setting the
   * height via JavaScript where the viewport vh unit isn't supported.
   * @see: http://caniuse.com/viewport-units.
   */
  setHeights: function() { 

    // Support for the vh unit is not supported well in iOS, so we just fall
    // back to setting the height manuall.  For more information, see:
    // https://github.com/scottjehl/Device-Bugs/issues/36 and 
    // http://blog.rodneyrehm.de/archives/34-iOS7-Mobile-Safari-And-Viewport-Units.html

    if ($("html").hasClass("cssvhunit") && !dlow.isIOS()) {
      return;
    }

    var height = $(window).height();

    this.$siteHeader.css("height", height + "px");

    if (!dlow.isMobile()) {
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


  /**
   * @description The contents section is visible when the window's scroll top
   * is within 300px of the top of it.
   */
  isContentsSectionVisible: function() { 
    return $(window).scrollTop() >= this.heights.contentsSectionOffsetTop - 300;
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

    if (dlow.isMobile()) {
      this.$siteHeaderLogo.css("opacity", 1);
      return;
    }

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
   * @desccription The background images for the content navigation section are
   * not shown initially to slim down the amount of images the mobile site must
   * load.  So if we're not on a mobile device then swap the data-nonmobilestyle
   * attribute for a style attribute to show the background images.
   */
  showContentNavigationImages: function() { 
    if (dlow.isMobile()) {
      return;
    }

    var itemImages = $(".js-contents-navigation-item-image");

    for (var i = 0; i < itemImages.length; i++) {
      var $itemImage = $(itemImages[i]);
      var style = $itemImage.data("nonmobilestyle");

      $itemImage
        .attr("style", style)
        .removeData("nonmobilestyle");
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

    if (dlow.isMobile()) {
      return;
    }

    var fCallback = function($el) {
      $el.addClass("show-background-image");
    };

    this.loadBackgroundImage(this.$siteHeader, fCallback);
    this.loadBackgroundImage(this.$contentsSection, fCallback);
  },

  /**
   * @description Once we've scrolled down to the contents section then load 
   * each background image one at a time and after loaded scale in the 
   * navigation item. 
   */
  scaleInContentNavImages: function() {
    if (dlow.isMobile()) {
      return;
    }

    var self = this;
    var navItemImages = $(".js-contents-navigation-item-image");
    var currentImage = -1;

    var fScaleIn = function($navItemImage) {
      var $navItem = $navItemImage.closest(".js-contents-navigation-item");
      $navItem
        .one(
          "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
          fLoadNextNavItemImage
        )
        .removeClass("scaled-out");
    };

    var fLoadNextNavItemImage = function() { 
      currentImage += 1;

      if (currentImage == navItemImages.length) {
        return;
      }

      self.loadBackgroundImage($(navItemImages[currentImage]), fScaleIn);        
    };

    fLoadNextNavItemImage();
  },

  /**
   * @description Load the background image of the specified element and when 
   * available invoke the specified callback.  If there is no background image
   * then just return.
   */
  loadBackgroundImage: function($el, fCallback) {
    var src = $el.css("background-image");

    if (!src.match(/^url/)) {
      return;
    }

    src = src.replace(/(^url\()|(\)$|[\"\'])/g, '');

    $('<img>').attr('src', src).imagesLoaded(
      function() { 
        fCallback($el); 
      }
    );
  },
};