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
   *
   * TODO:
   *
   * 1) Add alt attribute to image and caption below image.
   * 2) Set height of post-images-zoom element to height of document if larger
   *    than the window.
   * 3) Use two classes, invisible and scale-in, because the plug-in will get
   *    the image sizing wrong if the scale of the post-images-zoom element is
   *    0 initially.  So we need to wire up the plug-in, with visibililty 
   *    hidden, and THEN scale it from 0 to 1.
   * 4) Finally, scale the post-images-zoom from the coordinates of the clicked
   *    post image.
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

    var $postImagesZoom = $([
      '<div class="post-images-zoom minimized" ' + 
        'style="height: ' + $(window).height() + 'px; top: ' + $(window).scrollTop() + 'px;">',
        '<ul>',
          fRenderListItems(),
        '</ul>',
      '</div'
    ].join(''));

    //
    // Add the large post images element to the DOM and intialize the plug-in.
    //

    $postImagesZoom.height($("body").outerHeight());
    $("body").append($postImagesZoom);

    $postImagesZoom.find("ul").elastislide({
      easing: 'ease',
      minItems: 1,
      speed: 750,
      start: $postImage.data("itemnum")
    });

    //
    // Finally, scale the new larger elastislide carousel into view.
    //

    $postImagesZoom.removeClass("minimized");
  }
};