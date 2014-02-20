/**
 * @description The content object defines the behavior for the content page of
 * the site.
 */
window.dlow.content = {

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
    });

    //
    // Event handlers
    //
    
    $(".js-post-image-link").on("click", $.proxy(this.postImageLink_click, this));
  },


  // --------------------------------------------------------------------------
  // Event Handlers 
  // --------------------------------------------------------------------------

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

    var fRenderListItems = function() { 
      var listItems = [];

      $postImages.find(".js-post-image").each(function() { 
        var $img = $(this);

        listItems.push([
          '<li>',
            '<img class="img-responsive" src="' + $img.data("largeimage") + '" />', 
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
    // Apply the simple carousel plug-in to the post images zoom, and once its
    // loaded add the scale out class, then remove the not-visible-class, and 
    // then add the scale in class.
    //

    var $postImagesZoom = $postImagesZoomWrapper.find(".js-post-images-zoom");

    var fSimpleCarousel_load = function() {
      var $simpleCarousel = $postImagesZoom.closest(".js-simple-carousel");

      $simpleCarousel.one(
        "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
        function() { 
          $simpleCarousel.removeClass("not-visible").addClass("scale-in");
        }
      );
      $simpleCarousel.addClass("scale-out").removeClass("not-visible");
    };

    $postImagesZoom.simplecarousel({
      maxItems: 1,
      showNavigation: true,
      onload: fSimpleCarousel_load
    });
  }
};