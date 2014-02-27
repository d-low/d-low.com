/**
 * @description The content object defines the behavior for the content page of
 * the site.
 */
window.dlow.content = {

  resizeTimeout: null,

  /**
   * @description Initialize home page specific events.
   */
  initialize: function() {

    //
    // Lazy load the images that are 200px below the fold and one the first one
    // is loaded intialize the simple carousel plug-in if not already initialized.
    //

    var fSimpleCarousel = function($postImages) {
      if (! $postImages.data("simplecarousel")) {
        $postImages.simplecarousel({
          handleResize: false,
          minItems: 2,
          showNavigation: true
        });
      }
    };

    $(".js-post-images").each(function() {
      var $postImages = $(this);

      $postImages.find("img.js-lazy-load").lazyload({
        load: function() { 
          $postImages.removeClass("uninitialized");
          fSimpleCarousel($postImages); 
        },
        threshold: 400
      });
    });

    $(".js-post-content-togglable").contenttoggle({
      collapsedHeight: 150,
      collapseText: "Show Less",
      expandText: "Read More",
      handleResize: false
    });

    //
    // Event handlers
    //
    
    $(window).on("resize", $.proxy(this.window_resize, this));
    $(".js-post-image-link").on("click", $.proxy(this.postImageLink_click, this));
  },

  /**
   * @description Inform our simple carousel and content toggle plug-ins to
   * resize themselves.  We do this once, here, rather than haivng the plug-ins
   * do it themselves, becase there will be cascading resize events as one
   * plug-in resizes itself thus triggering a resize event that others will 
   * need to handle.
   */
  resize: function() { 
    $(".js-post-content-togglable").contenttoggle("resize");
    $(".js-post-images").simplecarousel("resize");
  },


  // --------------------------------------------------------------------------
  // Event Handlers 
  // --------------------------------------------------------------------------

  window_resize: function() {
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout($.proxy(this.resize, this), 150);
  },

  /**
   * @description When a post image is clicked on clone the list and scale it
   * in to view ensuring the post image that was clicked on is displayed.
   * TODO: Refactor this method to work with jquery.simplecarousel instead of
   * elastislide.
   */
  postImageLink_click: function(e) {

    e.preventDefault();

    //
    // Elements
    //

    var $postImage = $(e.target).closest(".js-post-image-link");
    var $postImages = $postImage.closest(".js-post-images");
    var currentImage = $postImage.data("itemnum");

    var fRenderListItems = function() { 
      var listItems = [];

      $postImages.find(".js-post-image").each(function() { 
        var $img = $(this);

        listItems.push([
          '<li>',
            '<a href="javascript:void(0);">',
              '<img src="' + $img.data("largeimage") + '" title="' + $img.attr("title") + '" />', 
            '</a>',
          '</li>'
        ].join(''));
      });

      return listItems.join('');
    };

    var $postImagesZoomWrapper = $([
      '<div class="post-images-zoom-wrapper" style="height: ' + $("body").height() + 'px;">',
        '<ul class="post-images-zoom js-post-images-zoom not-visible">',
          fRenderListItems(),
        '</ul>',
      '</div'
    ].join(''));

    //
    // Add the large post images element to the DOM and intialize the plug-in.
    //

    $("body").append($postImagesZoomWrapper);

    window.setTimeout(function() { 
      $postImagesZoomWrapper.addClass("fade-in");
    }, 100);

    //
    // Event handler used to remove the simple carousel
    //

    var fSimpleCarouselRemove = function(e) {
      e.preventDefault();

      $simpleCarousel.one(
        "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
        function() {
          var $ul = $simpleCarousel.find("ul");
          $ul.simplecarousel("destroy");
          $ul.remove();

          $postImagesZoomWrapper.one(
            "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
            function() {
              window.setTimeout(function() { $postImagesZoomWrapper.remove(); }, 100);
            }
          );

          $postImagesZoomWrapper.removeClass("fade-in");
        }
      );

      $simpleCarousel.addClass("slide-up");
    };

    //
    // Apply the simple carousel plug-in to the post images zoom, and once its
    // loaded add the scale out class, then remove the not-visible-class, and 
    // then add the scale in class.
    //

    var $postImagesZoom = $postImagesZoomWrapper.find(".js-post-images-zoom");
    var $simpleCarousel = null;

    var fSimpleCarousel_load = function() {
      $simpleCarousel = $postImagesZoom.closest(".js-simple-carousel");
      
      $simpleCarousel.append(
        '<a class="simplecarousel-remove js-simplecarousel-remove" href="javascript:void(0);">x</a>'
      );

      $simpleCarousel.one(
        "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
        function() { 
          $postImagesZoom.removeClass("not-visible");
          $simpleCarousel.addClass("scale-in");
        }
      );
      $simpleCarousel.addClass("scale-out");
      $simpleCarousel.find(".js-simplecarousel-remove").one("click", fSimpleCarouselRemove);
    };

    $postImagesZoom.simplecarousel({
      carouselContentsHeight: "100%",
      currentImage: currentImage,
      maxItems: 1,
      showCaption: true,
      showNavigation: true,
      onload: fSimpleCarousel_load
    });
  }
};