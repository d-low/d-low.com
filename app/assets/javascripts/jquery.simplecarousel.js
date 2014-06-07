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
 * 2) Don't navigate further if last image is fully visible.
 */
(function($) {

  var pluginName = "simplecarousel";

  $.SimpleCarousel = function(options, element) { 
    this.$el = $(element);

    this.currentImage = 0;
    this.elems = null;
    this.resizeTimeout = null;
    this.totalImages = 0;
    this.listHeight = 0;
    this.firstImgWidth = 0;

    // Invoke our init() method after loading images if the imagesLoaded plug
    // in is available.

    if (typeof($().imagesLoaded) === 'function') {
      var fLoaded = $.proxy(function() { this.init(options); }, this);

      // TODO: Using the options now is awkward, we should merge them with our
      // defaults now to avoid doing things like the next two lines.
      var maxItems = typeof(options.maxItems) !== 'undefined' ? options.maxItems : undefined;
      var currentImage = typeof(options.currentImage) !== 'undefined' ? options.currentImage : 0;

      // When called to display one image at a time we call init() after loading
      // the requested image, not all of them, since that takes much longer.

      if (maxItems == 1) {
        var $img = this.$el.find("img").eq(currentImage);
        $img.imagesLoaded(fLoaded);
      }
      else {
        this.$el.imagesLoaded(fLoaded);
      }
    }
    else {
      this.init(options);
    }
  };

  $.SimpleCarousel.defaults = {
    carouselContentsHeight: null,
    currentImage: 0,
    handleResize: true,
    maxHeight: null,
    maxWidth: null,
    maxItems: null,
    minItems: 1,
    showCaption: false,
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
    
    this._getOriginalSizes();

    // If the original length and width is zero then we need to retry

    if (this.firstImgWidth <= 1) {
      window.setTimeout($.proxy(function() { this.init(options); }, this), 500);
      return;
    }

    // TODO: Touch the DOM once, inserting generated content all at once,
    // rather than incrementally.

    this.$el.wrap([
      '<div class="simple-carousel js-simple-carousel loading">',
        '<div class="simple-carousel-wrapper js-simple-carousel-wrapper">',
        '</div>',
      '</div>'
    ].join(''));

    if (this.options.showCaption) {
      this.$el.find("li").each(function() { 
        var $li = $(this);
        var $img = $li.find("img");
        $li.addClass("showing-caption");
        $li.append('<span class="simple-carousel-caption">' + $img.attr("title") + '</span>');
      });
    }

    if (this.options.showNavigation) {
      this.$el.closest(".js-simple-carousel").prepend([
        '<a class="simple-carousel-nav js-simple-carousel-nav simple-carousel-nav-prev ' + 
          'js-simple-carousel-nav-prev button" href="javascript:void(0);">',
          '<span class="simple-carousel-nav-text l-simple-carousel-nav-text">',
            '&lt;',
          '</span>',
        '</a>'
      ].join(''));

      this.$el.closest(".js-simple-carousel").append([
        '<a class="simple-carousel-nav js-simple-carousel-nav simple-carousel-nav-next ' + 
          'js-simple-carousel-nav-next button" href="javascript:void(0);">',
          '<span class="simple-carousel-nav-text l-simple-carousel-nav-text">',
            '&gt;',
          '</span>',
        '</a>',
      ].join(''));
    }

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

    //
    // Calculate and set the sizes of each list item and the list itself.
    //

    this._getElements();
    this._setSizes();

    //
    // Add event handlers
    //

    if (this.options.handleResize) {
      $(window).on(
        "resize." + pluginName, 
        $.proxy(this._window_resize, this)
      );
    }

    this.elems.$simpleCarouselNavPrev.on(
      "click." + pluginName, 
      $.proxy(this._navPrev_click, this)
    );

    this.elems.$simpleCarouselNavNext.on(
      "click." + pluginName, 
      $.proxy(this._navNext_click, this)
    );

    //
    // Update our UI for the initial state.
    //

    this.currentImage = this.options.currentImage;
    this._scrollToCurrentImage();
    this._updateNavigation();
    this.elems.$simpleCarousel.removeClass("loading");

    //
    // And inform the caller that we're done.  Note that the caller can choose
    // not to specify an onload handler, but we have a stub in our options.
    //

    this.options.onload(this.$el);

    //
    // Finally, if we were called to view a single image and the imagesLoaded 
    // plug-in is available then lets iterate through our images in both 
    // directions loaded one at a time until they're all loaded.
    //

    if (typeof($().imagesLoaded) === 'function' && this.options.maxItems == 1) {
      var self = this;
      var prevImg = this.currentImage - 1;
      var nextImg = this.currentImage + 1;
      var numImgs = this.elems.listItems.length;

      var fLoadPrevImg = function() { 
        if (prevImg >= 0) {
          var $img = $(self.elems.listItems[prevImg]).find("img");
          prevImg = prevImg - 1;
          $img.imagesLoaded(fLoadPrevImg);
        }
      };

      var fLoadNextImg = function() {
        if (nextImg < numImgs) {
          var $img = $(self.elems.listItems[nextImg]).find("img");
          nextImg = nextImg + 1;
          $img.imagesLoaded(fLoadNextImg);
        }
      };

      fLoadPrevImg();
      fLoadNextImg();
    }
  };

  $.SimpleCarousel.prototype.destroy = function() {

    //
    // Remove event handlers
    //

    if (this.options.handleResize) {
      $(window).off("resize." + pluginName);
    }
    
    this.elems.$simpleCarouselNavPrev.off("click." + pluginName);
    this.elems.$simpleCarouselNavNext.off("click." + pluginName);

    //
    // Remove inline styles and data we've added. 
    //

    this.$el.find("a").css("background-image", "none");
    this.$el.removeAttr("style");
    this.$el.removeData(pluginName);
    this.elems.listItems.removeAttr("style");

    //
    // Remove generated content
    //

    this.elems.$simpleCarouselNavPrev.remove();
    this.elems.$simpleCarouselNavNext.remove();

    if (this.options.showCaption) {
      this.$el.find("li").removeClass("showing-caption");
      this.$el.find("span.simple-carousel-caption").remove();
    }

    if (this.$el.parent().is(".js-simple-carousel-wrapper")) {
      this.$el.unwrap();
    }

    if (this.$el.parent().is(".js-simple-carousel")) {
      this.$el.unwrap();
    }

    this.$el.removeData(pluginName);
  };

  $.SimpleCarousel.prototype.resize = function() {
    this._setSizes();
    this._scrollToCurrentImage();
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
    this.resizeTimeout = window.setTimeout($.proxy(this.resize, this), 150);
  };

  $.SimpleCarousel.prototype._navPrev_click = function(e) { 
    e.preventDefault();

    if (this.currentImage == 0) {
      return;
    }

    this.currentImage -= 1;
    this._scrollToCurrentImage();
    this._updateNavigation();
  };

  $.SimpleCarousel.prototype._navNext_click = function(e) {
    e.preventDefault();

    if (this.currentImage == this.elems.listItems.length - 1) {
      return;
    } 

    this.currentImage += 1;
    this._scrollToCurrentImage();
    this._updateNavigation();
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

    this.totalImages = this.elems.listItems.length;
  };

  /**
   * @description Get the width of the first available image and the height of
   * its list item prior to wrapping the <ul> since the sizes of wrapped 
   * content may changed.  
   * NOTE:  We iterate through the images until one is found with a width and 
   * height.  This plug-in is called after an image is loaded, but it might not
   * be the first, so we need to iterate through them all until we find one 
   * that has been loaded.
   */
  $.SimpleCarousel.prototype._getOriginalSizes = function() { 
    var liElems = this.$el.find("li");

    // If requested to only view a single image at a time then use only the 
    // requested image below when calculating the list height and image width.

    if (this.options.maxItems == 1) {
      if (liElems.length > this.options.currentImage) {
        liElems = [ liElems[this.options.currentImage] ];
      }
    }

    for (var i = 0; i < liElems.length; i++) {
      if (this.firstImgWidth > 1) {
        break;
      }

      var $li = $(liElems[i]);

      this.listHeight = $li.outerHeight();

      if (this.options.maxHeight && this.listHeight > this.options.maxHeight) {
        this.listHeight = this.options.maxHeight;
      }
      
      this.firstImgWidth = $li.find("img").outerWidth();
    }
  };

  /**
   * @description Set element sizes.
   */
  $.SimpleCarousel.prototype._setSizes = function() { 

    //
    // TODO: 
    //
    // 1) Touch DOM for inline styles once
    //

    //
    // We may be able to fit more items in the carousel wrapper than requested
    // so if that's the case, we'll do so!
    //

    var carouselWrapperWidth = this.elems.$simpleCarouselWrapper.outerWidth();
    var firstImgWidth = this.firstImgWidth || this.elems.$firstImg.outerWidth();
    var minItems = parseInt(carouselWrapperWidth / firstImgWidth, 10);

    minItems = minItems > this.options.minItems ? minItems : this.options.minItems;

    if (this.options.maxItems && minItems > this.options.maxItems) {
      minItems = this.options.maxItems;
    }

    //
    // Calculate the list height, max width in pixels of each list item, the
    // list item width as a percentage, and the list width as a function of the
    // number of list items and list item max width.
    //

    var listHeight = this.listHeight || $(this.elems.listItems[0]).outerHeight();
    var itemMaxWidth = this.elems.$simpleCarouselWrapper.outerWidth() / minItems;
    var itemWidth = parseInt(100 / minItems, 10);
    var listWidth = this.elems.listItems.length * itemMaxWidth;

    if (itemMaxWidth < 10) {
      debugger;
    }

    if (this.options.maxWidth) {
      itemMaxWidth = parseInt(this.options.maxWidth * 0.8, 10);
    }

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

    if (this.options.maxWidth) {
      this.elems.$simpleCarousel.css({
        "max-width": this.options.maxWidth + "px"
      });

      var width = this.elems.$simpleCarousel.outerWidth();
      var winWidth = $(window).width();

      var left = parseInt((winWidth - width) / 2, 10);

      this.elems.$simpleCarousel.css({
        "left": left + "px"
      });
    }

    if (this.options.maxHeight) {

      // The list height will be either the max height or less than the max 
      // height if the images are smaller than the requested max height.  And
      // we add 10px for top and bottom padding.

      this.elems.$simpleCarousel.css({
        "max-height": parseInt(listHeight, 10) + 10 + "px"
      });
    }

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

  /**
   * @description Enable/disable the previous/next navigation links if 
   * displaed depending on the current image.
   */
  $.SimpleCarousel.prototype._updateNavigation = function() { 
    if (! this.options.showNavigation) {
      return;
    }

    if (this.currentImage === 0) {
      this.elems.$simpleCarouselNavPrev.addClass("disabled");
      this.elems.$simpleCarouselNavNext.removeClass("disabled");
    }
    else if (this.currentImage === this.totalImages - 1) {
      this.elems.$simpleCarouselNavPrev.removeClass("disabled");
      this.elems.$simpleCarouselNavNext.addClass("disabled");
    }
    else {
      this.elems.$simpleCarouselNavPrev.removeClass("disabled");
      this.elems.$simpleCarouselNavNext.removeClass("disabled");
    }
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

