/**
 * @description A simple responsive carousel plug-in that uses CSS3 transitions
 * for navigation.  The plug-in should be passed a handle to a single unordered 
 * list with each list item containing an image.  The plug-in can be 
 * parameterized as follows:
 * @param minItems The minimum number of items to show.  Show more if possible.
 * @param maxItems The maximum number of items to show.  Show no more than this.
 * @param showNavigation If set to true then show traditional links to navigate
 * forward and backward in the list.
 * TODO:
 * 1) Handle resize event with respect to minItems and maxItems parameters.
 * 2) Lazy load images if requested, or by default (TBD).
 * 3) Handle swip navigation if requested, or by default if supported, using 
 * swipe.js.
 * 4) Determine and use max number of images too!
 */
(function($) {

  var pluginName = "jQuery.simplecarousel";

  var defaults = {
    minItems: 1,
    maxItems: null,
    showNavigation: true
  };


  // --------------------------------------------------------------------------
  // Public Methods
  // --------------------------------------------------------------------------

  var init = function(options) { 

    options = $.extend(true, {}, defaults, options);
    var $el = $(this);

    //
    // Add generated content and optional navigation
    //

    $el.wrap([
      '<div class="simple-carousel js-simple-carousel">',
        '<div class="simple-carousel-wrapper js-simple-carousel-wrapper">',
        '</div>',
      '</div>'
    ].join(''));

    if (options.showNavigation) {
      $el.closest(".js-simple-carousel").prepend([
        '<a class="simple-carousel-nav js-simple-carousel-nav simple-carousel-nav-prev js-simple-carousel-nav-prev" href="javascript:void(0);">',
          '<span>',
            '&lt;',
          '</span>',
        '</a>'
      ].join(''));

      $el.closest(".js-simple-carousel").append([
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

    var elems = getElements($el);

    setSizes(elems, options);

    elems.$el.data("currentimage", 1);

    //
    // Add event handlers
    //

    elems.$simpleCarouselNavPrev.on("click.simplecarousel", {el: $el}, navPrev_click);
    elems.$simpleCarouselNavNext.on("click.simplecarousel", {el: $el}, navNext_click);

    return $el;
  };

  // TODO: Verify that this still works!  The navigation elements have been
  // added since this was last tested.
  var destroy = function() {

    var $el = $(this);
    var elems = getElements($el);

    //
    // Remove event handlers
    //

    elems.$simpleCarouselNavPrev.off("click.simplecarousel");
    elems.$simpleCarouselNavNext.off("click.simplecarousel");

    //
    // TODO: Remove inline styles we may have added. 
    //

    //
    // Remove generated content
    //

    elems.$simpleCarouselNavPrev.remove();
    elems.$simpleCarouselNavNext.remove();

    if ($el.parent().is(".js-simple-carousel-wrapper")) {
      $el.unwrap();
    }

    if ($el.parent().is(".js-simple-carousel")) {
      $el.unwrap();
    }

    return $el;
  };


  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  // TODO: navPrev_click() and navNext_click() can be consolidated.  The only 
  // differences are really the exit condition and whether we decrement or 
  // increment the current image.
  var navPrev_click = function(e) { 
    e.preventDefault();

    var $el = e.data.el;
    var currentImage = $el.data("currentimage");

    if (currentImage == 1) {
      return;
    }

    currentImage = currentImage - 1;

    var $li = $el.find("li:nth-child(" + currentImage + ")");

    $el.css("margin-left", ($li.position().left * -1) + "px");
    $el.data("currentimage", currentImage);
  };

  var navNext_click = function(e) {
    e.preventDefault();

    var $el = e.data.el;
    var currentImage = $el.data("currentimage");

    if (currentImage == $el.find("li").length) {
      return;
    } 

    currentImage = currentImage + 1;

    var $li = $el.find("li:nth-child(" + currentImage  + ")");

    $el.css("margin-left", ($li.position().left * -1) + "px");
    $el.data("currentimage", currentImage);
  };


  // --------------------------------------------------------------------------
  // Private Methods
  // --------------------------------------------------------------------------

  /**
   * @description Return the common element handles used in most methods.
   * @param $el jQuery handle to original ul element that the plug-in wraps.
   */
  var getElements = function($el) {
    var $simpleCarouselWrapper = $el.closest(".js-simple-carousel-wrapper");
    var $simpleCarouselNavPrev = $simpleCarouselWrapper.siblings(".js-simple-carousel-nav-prev");
    var $simpleCarousel = $simpleCarouselWrapper.closest(".js-simple-carousel");
    var $simpleCarouselNavNext = $simpleCarouselWrapper.siblings(".js-simple-carousel-nav-next"); 
    var listItems = $el.find("li");
    var $firstImg = $el.find("img:first");   

    return {
      $el: $el,
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
   * @param elems Elements object as returned by getElements().
   * @param options Options object as originally obtained in init().
   */
  var setSizes = function(elems, options) { 

    var listHeight = $(elems.listItems[0]).outerHeight();
    var itemMaxWidth = elems.$simpleCarouselWrapper.outerWidth() / options.minItems;
    var itemWidth = parseInt(100 / options.minItems, 10);
    var listWidth = elems.listItems.length * itemMaxWidth;

    elems.$simpleCarouselNavPrev.css({
      "height": listHeight + "px"
    });

    elems.$simpleCarouselNavNext.css({
      "height": listHeight + "px"
    });

    elems.$el.css({
      "height": listHeight + "px",
      "width": listWidth + "px"
    });

    elems.listItems.css({
      "max-width": itemMaxWidth + "px",
      "width": itemWidth + "%"
    });
  };


  // --------------------------------------------------------------------------
  // Plug-in Setup Data and Methods
  // --------------------------------------------------------------------------

  var methods = {
    "init": init,
    "destroy": destroy
  };

  $.fn.simplecarousel = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error("Method " + method + " does not exist on " + pluginName + ".");
    } 
  };

})(jQuery);