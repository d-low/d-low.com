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
    // Event handlers
    //

    $(".js-post-images").each(function() {
      $(this).elastislide({
        easing: 'ease',
        minItems: 2,
        speed: 750
      });
    });

    $(".js-post-content-toggle").on("click", $.proxy(this.contentToggle_click, this));
    $(".js-post-image-link").on("click", $.proxy(this.postImageLink_click, this));

    //
    // Miscellaneous initializations
    //

    this.initPostContentMaxHeight();
  },

  /**
   * @description Set the max height of all post content elements to the height
   * of their event containers to allow for a more realistic max height 
   * transition when expanding/collapsing post content.  
   */
  initPostContentMaxHeight: function() {

    $(".eventContainer").each(function() {
      var $eventContainer = $(this);
      var $postContent = $eventContainer.closest(".js-post-content");
      $postContent.css("max-height", $eventContainer.height() + "px");
    })
  },


  // --------------------------------------------------------------------------
  // Event Handlers 
  // --------------------------------------------------------------------------

  /**
   * @description Collapse/expand the corresponding post content.  Afer
   * collapsing the post content we then scroll the top of the post back into 
   * view with 10px of padding to it isn't flush with the top of the screen.
   */
  contentToggle_click: function(e) {

    e.preventDefault();

    var $postContentToggle = $(e.target).closest(".js-post-content-toggle");
    var $postContent = $postContentToggle.closest(".js-post").find(".js-post-content");

    if ($postContent.hasClass("collapsed")) {
      $postContent.removeClass("collapsed");
      $postContentToggle.html("Show Less");
    }
    else {
      var $post = $postContent.closest(".js-post");

      $postContent.on(
        "transitionend webkitTransitionEnd oTransitionEnd otransitionend",
        function() { 
          $postContent.off("transitionend webkitTransitionEnd oTransitionEnd otransitionend");
          dlow.scrollUpTo($post.offset().top - 40);
        }
      );

      $postContent.addClass("collapsed");
      $postContentToggle.html("Read More");
    }
  },

  /**
   * @description When a post image is clicked on clone the list and scale it
   * in to view ensuring the post image that was clicked on is displayed.
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