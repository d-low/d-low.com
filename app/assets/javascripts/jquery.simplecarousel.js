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
 */
(function($) {

  var pluginName = "jQuery.simplecarousel";

  var defaults = {
    minItems: 1,
    maxItems: null,
    showNavigation: true
  };

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
      $el.closest(".js-simple-carousel").append([
        '<nav class="simple-carousel-nav js-simple-carousel-nav">',
          '<a class="simple-carousel-prev js-simple-carousel-prev" href="javascript:void(0);">',
            '&lt;',
          '</a>',
          '<a class="simple-carousel-next js-simple-carousel-next" href="javascript:void(0);">',
            '&gt;',
          '</a>',
        '</nav>'
      ].join(''));
    }

    //
    // Calculate and set the width of each list item and the list itself.
    //
    // TODO: Move this to a method so that it can be invoked on resize and used
    // to recalculate the dimensions of our elements.
    //

    var $simpleCarouselWrapper = $el.closest(".js-simple-carousel-wrapper");
    var $simpleCarousel = $simpleCarouselWrapper.closest(".js-simple-carousel");
    var $img = $el.find("img:first");

    var listHeight = $el.find("li:first").outerHeight();
    var itemMaxWidth = $simpleCarouselWrapper.outerWidth() / options.minItems;
    var itemWidth = parseInt(100 / options.minItems, 10);
    var listWidth = $el.find("li").length * itemMaxWidth;

    $el.css({
      "height": listHeight + "px",
      "width": listWidth + "px"
    });

    $el.find("li").css({
      "max-width": itemMaxWidth + "px",
      "width": itemWidth + "%"
    });

    //
    // TODO: 
    // 1) Add event handlers.
    //

    return $el;
  };

  var destroy = function() {
    var $el = $(this);

    //
    // Remove generated content
    //

    $el.closest(".js-simple-carousel-wrapper").siblings(".js-simple-carousel-nav").remove();

    if ($el.parent().is(".js-simple-carousel-wrapper")) {
      $el.unwrap();
    }

    if ($el.parent().is(".js-simple-carousel")) {
      $el.unwrap();
    }

    //
    // TODO: 
    // 1) Remove any inline styles we may have added. 
    // 2) Remove event handlers
    //

    return $el;
  };

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