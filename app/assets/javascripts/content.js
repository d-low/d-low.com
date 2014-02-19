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
        load: function() { fSimpleCarousel($postImages); },
        threshold: 200
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
    
    // TODO: Wire up functionality to create new list of larger images, apply
    // the carousel, fade in the shim, and then scale in the images; once the
    // basic plug-in works.
    // $(".js-post-image-link").on("click", $.proxy(this.postImageLink_click, this));
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
        listItems.push([
          '<li>',
            '<img class="img-responsive" src="' + $(this).data("largeimage") + '" />', 
          '</li>'
        ].join(''));
      });

      return listItems.join('');
    };

    var $elastislideWrapper = null;
    var $postImagesZoom = $([
      '<div class="post-images-zoom fade-out" ' + 
        'style="height: ' + $(window).height() + 'px; top: ' + $(window).scrollTop() + 'px;">',
        '<ul>',
          fRenderListItems(),
        '</ul>',
      '</div'
    ].join(''));

    //
    // When the elastislide remove link is clicked we slide the elastislide
    // wrapper up, then remove the plug-in from the list, then fade out the 
    // post images zoom shim, and remove it.
    //
    // TODO: 
    //
    // 1) All these nested functions are a bit messy, should they be broke
    // out into individual functions?
    //

    var fElastislideRemove = function(e) {
      e.preventDefault();

      $elastislideWrapper.one(
        "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
        function() {
          $postImagesZoom.find("ul").elastislide("destroy");

          $postImagesZoom.one(
            "transitionend webkitTransitionEnd oTransitionEnd otransitionend", 
            function() {
              window.setTimeout(function() { $postImagesZoom.remove(); }, 100);
            }
          );

          $postImagesZoom.removeClass("fade-in");
        }
      );

      $elastislideWrapper.addClass("slide-up");
    };

    //
    // Fade in the post images zoom container and then scale in the elastislide
    // wrapper.  Note that the elastislide wrapper is intially rendered with 
    // opacity of zero so that elements are sized properly, but not visible.  
    //

    var fOnReady = function() {
      $postImagesZoom.one("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
        $elastislideWrapper = $postImagesZoom.find(".elastislide-wrapper");

        $elastislideWrapper.append(
          '<a class="elastislide-remove js-elastislide-remove" href="javascript:void(0);">x</a>'
        );

        $elastislideWrapper.one("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
          $elastislideWrapper.addClass("scale-in");
          $elastislideWrapper.find(".js-elastislide-remove").on("click", fElastislideRemove);
        });

        $elastislideWrapper.addClass("scale-out");
      });

      $postImagesZoom.addClass("fade-in");
    };

    //
    // Add the large post images element to the DOM and intialize the plug-in.
    //

    $postImagesZoom.height(
      $("body").outerHeight()
    );

    $("body").append($postImagesZoom);

    $postImagesZoom.find("ul").elastislide({
      easing: 'ease',
      minItems: 1,
      speed: 750,
      start: $postImage.data("itemnum"),
      onReady: fOnReady
    });
  }
};