/**
 * @description A simple responsive carousel plug-in that uses CSS3 transitions
 * for navigation.  The plug-in should be passed a handle to a single unordered 
 * list with each list item containing an image.  Rather than struggle with 
 * attempting to vertically and horizontally center image elements, which is 
 * very hard, instead we set the visibility of the images to hidden and use 
 * the image src (or data-original if they haven't been lazy loaded yet), as 
 * the background of the parent anchor element.  Using CSS3 properties we can 
 * then vertially and horizontally center the images with ease.
 * TODO:
 * 1) Handle swipe navigation if requested, or by default if supported, using 
 * swipe.js.
 * 2) Enable/disable navigation buttons when on first/last image.
 * 3) Don't navigate further if last image is fully visible.
 */
(function($) {

  var pluginName = "simplecarousel";

  $.SimpleCarousel = function(options, element) { 
    this.$el = $(element);

    this.currentImage = 0;
    this.elems = null;
    this.resizeTimeout = null;

    if (typeof($().imagesLoaded) === 'function') {
      this.$el.imagesLoaded(
        $.proxy(function() { this.init(options); }, this)
      );
    }
    else {
     this.init(options);
    }
  };

  $.SimpleCarousel.defaults = {
    carouselContentsHeight: null,
    maxItems: null,
    minItems: 1,
    showNavigation: true,
    onload: function($el) { return; }
  };


  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  $.SimpleCarousel.prototype.init = function(options) { 

    this.options = $.extend(true, {}, $.SimpleCarousel.defaults, options);

    // Get the original sizes before wrapping the content since they may change 
    // after being wrapped.
    // TODO: If the original length and width is zero, we need to retry...
    this._getOriginalSizes();

    //
    // Add background images, generated content and optional navigation
    //

    this.$el.find("li a").each(function() {
      var $a = $(this);
      var $img = $a.find("img");
      var url = $img.attr("src");
      var original = $img.data("original");

      url = url.match(/blank/) ? original : url;

      $a.css("background-image", "url(" + url + ")");
    });

    this.$el.wrap([
      '<div class="simple-carousel js-simple-carousel">',
        '<div class="simple-carousel-wrapper js-simple-carousel-wrapper">',
        '</div>',
      '</div>'
    ].join(''));

    if (this.options.showNavigation) {
      this.$el.closest(".js-simple-carousel").prepend([
        '<a class="simple-carousel-nav js-simple-carousel-nav simple-carousel-nav-prev js-simple-carousel-nav-prev" href="javascript:void(0);">',
          '<span>',
            '&lt;',
          '</span>',
        '</a>'
      ].join(''));

      this.$el.closest(".js-simple-carousel").append([
        '<a class="simple-carousel-nav js-simple-carousel-nav simple-carousel-nav-next js-simple-carousel-nav-next" href="javascript:void(0);">',
          '<span>',
            '&gt;',
          '</span>',
        '</a>',
      ].join(''));
    }

    //
    // Calculate and set the sizes of each list item and the list itself.
    //

    this._getElements();
    this._setSizes();

    //
    // Add event handlers
    //

    $(window).on(
      "resize." + pluginName, 
      $.proxy(this._window_resize, this)
    );

    this.elems.$simpleCarouselNavPrev.on(
      "click." + pluginName, 
      $.proxy(this._navPrev_click, this)
    );

    this.elems.$simpleCarouselNavNext.on(
      "click." + pluginName, 
      $.proxy(this._navNext_click, this)
    );

    //
    // And inform the caller that we're done.  Note that the caller can choose
    // not to specify an onload handler, but we have a stub in our options.
    //

    this.options.onload(this.$el);
  };

  // TODO: Verify that this still works!  The navigation elements have been
  // added since this was last tested.
  $.SimpleCarousel.prototype.destroy = function() {

    //
    // Remove event handlers
    //

    $(window).off("resize." + pluginName);
    this.elems.$simpleCarouselNavPrev.off("click." + pluginName);
    this.elems.$simpleCarouselNavNext.off("click." + pluginName);

    //
    // Remove inline styles and data we've added. 
    //

    this.$el.removeAttr("style");
    this.$el.removeData(pluginName);
    this.elems.listItems.removeAttr("style");

    //
    // Remove generated content
    //

    this.elems.$simpleCarouselNavPrev.remove();
    this.elems.$simpleCarouselNavNext.remove();

    if (this.$el.parent().is(".js-simple-carousel-wrapper")) {
      this.$el.unwrap();
    }

    if (this.$el.parent().is(".js-simple-carousel")) {
      this.$el.unwrap();
    }

    this.$el.removeData(pluginName);
  };


  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /** 
   * @description Set timeouts to catch the final window resize event and when
   * the final one is caught re-set the sizes of our elements and scroll back 
   * to the current image.
   */
  $.SimpleCarousel.prototype._window_resize = function(e) { 
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout($.proxy(this._handle_resize, this), 150);
  };

  $.SimpleCarousel.prototype._handle_resize = function() {
    this._setSizes();
    this._scrollToCurrentImage();
  };

  $.SimpleCarousel.prototype._navPrev_click = function(e) { 
    e.preventDefault();

    if (this.currentImage == 0) {
      return;
    }

    this.currentImage -= 1;
    this._scrollToCurrentImage();
  };

  $.SimpleCarousel.prototype._navNext_click = function(e) {
    e.preventDefault();

    if (this.currentImage == this.elems.listItems.length - 1) {
      return;
    } 

    this.currentImage += 1;
    this._scrollToCurrentImage();
  };


  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * @description Return the common element handles used in most methods.
   */
  $.SimpleCarousel.prototype._getElements = function() {
    var $simpleCarouselWrapper = this.$el.closest(".js-simple-carousel-wrapper");
    var $simpleCarouselNavPrev = $simpleCarouselWrapper.siblings(".js-simple-carousel-nav-prev");
    var $simpleCarousel = $simpleCarouselWrapper.closest(".js-simple-carousel");
    var $simpleCarouselNavNext = $simpleCarouselWrapper.siblings(".js-simple-carousel-nav-next"); 
    var listItems = this.$el.find("li");
    var $firstImg = this.$el.find("img:first");   

    this.elems = {
      $simpleCarouselWrapper: $simpleCarouselWrapper,
      $simpleCarouselNavPrev: $simpleCarouselNavPrev,
      $simpleCarousel: $simpleCarousel,
      $simpleCarouselNavNext: $simpleCarouselNavNext,
      listItems: listItems,
      $firstImg: $firstImg
    };
  };

  /**
   * @description Get the width of the first image and the height of the first
   * list item prior to wrapping the <ul> since the sizes of wrapped content 
   * may changed.
   * TBD: Should find the largest image, and then use the height of that for 
   * the list height?
   */
  $.SimpleCarousel.prototype._getOriginalSizes = function() { 
    var $firstLi = this.$el.find("li:first");

    this.listHeight = $firstLi.outerHeight();
    this.firstImgWidth = $firstLi.find("img").outerWidth();
  };

  /**
   * @description Set element sizes.
   */
  $.SimpleCarousel.prototype._setSizes = function() { 

    // TODO: Need to wire up max items.

    //
    // We may be able to fit more items in the carousel wrapper than requested
    // so if that's the case, we'll do so!
    //

    var carouselWrapperWidth = this.elems.$simpleCarouselWrapper.outerWidth();
    var firstImgWidth = this.firstImgWidth || this.elems.$firstImg.outerWidth();
    var minItems = parseInt(carouselWrapperWidth / firstImgWidth, 10);

    minItems = minItems > this.options.minItems ? minItems : this.options.minItems;

    //
    // Calculate the list height, max width in pixels of each list item, the
    // list item width as a percentage, and the list width as a function of the
    // number of list items and list item max width.
    //

    var listHeight = this.listHeight || $(this.elems.listItems[0]).outerHeight();
    var itemMaxWidth = this.elems.$simpleCarouselWrapper.outerWidth() / minItems;
    var itemWidth = parseInt(100 / minItems, 10);
    var listWidth = this.elems.listItems.length * itemMaxWidth;

    //
    // Use carousel contents height specified by caller if available
    //

    if (this.options.carouselContentsHeight) {
      listHeight = this.options.carouselContentsHeight;
    }
    else {
      listHeight = listHeight + "px";
    }
    //
    // Set heights, max-widths, and widths.
    //

    if (this.options.carouselContentsHeight) {
      this.elems.$simpleCarouselWrapper.css({
        "height": listHeight
      });
    }

    this.elems.$simpleCarouselNavPrev.css({
      "height": listHeight
    });

    this.elems.$simpleCarouselNavNext.css({
      "height": listHeight
    });

    this.$el.css({
      "height": listHeight,
      "width": listWidth + "px"
    });

    this.elems.listItems.css({
      "max-width": itemMaxWidth + "px",
      "width": itemWidth + "%"
    });
  };

  /**
   * @description Set the margin left of the unordered list to scroll the
   * current image into view.
   */
  $.SimpleCarousel.prototype._scrollToCurrentImage = function() {
    var $li = $(this.elems.listItems[this.currentImage]);
    this.$el.css("margin-left", ($li.position().left * -1) + "px");
  };


  var logError = function(message) {
    if (window.console) {
      window.console.error(message);
    }
  };


  // --------------------------------------------------------------------------
  // Plug In Definition
  // --------------------------------------------------------------------------

  $.fn.simplecarousel = function(options) {

    if (typeof options === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);

      this.each(function() {
        var self = $.data(this, pluginName);
        
        if (!self) {
          logError(
            "Cannot call methods on " + pluginName + " " +
            "prior to initialization; " +
            "attempted to call method '" + options + "'" 
          );
          return;
        }

        if (!$.isFunction(self[options]) || options.charAt(0) === "_" ) {
          logError("No such method '" + options + "' for " + pluginName);
          return;
        }

        self[options].apply(self, args);  
      });
    }
    else {
      this.each(function() {
        var self = $.data(this, pluginName);

        if (self) {
          self.init();
        }
        else {
          self = $.data(this, pluginName, new $.SimpleCarousel(options, this));
        }

      });
    }

    return this;
  };

})(jQuery);

