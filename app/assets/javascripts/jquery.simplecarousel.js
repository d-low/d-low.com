/**
 * @description A simple responsive carousel plug-in that uses CSS3 transitions
 * for navigation.  The plug-in should be passed a handle to a single unordered 
 * list with each list item containing an image.  
 * TODO:
 * 1) Lazy load images if requested, or by default (TBD).
 * 2) Handle swipe navigation if requested, or by default if supported, using 
 * swipe.js.
 */
(function($) {

  var pluginName = "simplecarousel";

  $.SimpleCarousel = function(options, element) { 
    this.$el = $(element);

    this.currentImage = 0;
    this.elems = null;
    this.resizeTimeout = null;

    this.init(options);
  };

  $.SimpleCarousel.defaults = {
    minItems: 1,
    maxItems: null,
    showNavigation: true
  };


  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  $.SimpleCarousel.prototype.init = function(options) { 

    this.options = $.extend(true, {}, $.SimpleCarousel.defaults, options);

    //
    // Add generated content and optional navigation
    //

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
   * @description Set element sizes.
   */
  $.SimpleCarousel.prototype._setSizes = function() { 

    //
    // We may be able to fit more items in the carousel wrapper than requested
    // so if that's the case, we'll do so!
    //

    var carouselWrapperWidth = this.elems.$simpleCarouselWrapper.outerWidth();
    var firstImgWidth = this.elems.$firstImg.outerWidth();
    var minItems = parseInt(carouselWrapperWidth / firstImgWidth, 10);

    minItems = minItems > this.options.minItems ? minItems : this.options.minItems;

    //
    // Calculate the list height, max width in pixels of each list item, the
    // list item width as a percentage, and the list width as a function of the
    // number of list items and list item max width.
    //

    var listHeight = $(this.elems.listItems[0]).outerHeight();
    var itemMaxWidth = this.elems.$simpleCarouselWrapper.outerWidth() / minItems;
    var itemWidth = parseInt(100 / minItems, 10);
    var listWidth = this.elems.listItems.length * itemMaxWidth;

    //
    // Set heights, max-widths, and widths.
    //

    this.elems.$simpleCarouselNavPrev.css({
      "height": listHeight + "px"
    });

    this.elems.$simpleCarouselNavNext.css({
      "height": listHeight + "px"
    });

    this.$el.css({
      "height": listHeight + "px",
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