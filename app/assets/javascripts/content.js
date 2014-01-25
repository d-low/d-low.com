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
        minItems: 2
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

    var $postImage = $(e.target).closest(".js-post-image-link");
    var $postImages = $postImage.closest(".js-post-images");
    var $postImagesLarge = $postImages.clone();
    var $elastislideWrapper = null;

    $postImagesLarge.addClass("post-images-large js-post-images-large");

    $("body").append($postImagesLarge);

    $postImagesLarge.elastislide({
      minItems: 1,
      start: $postImage.data("itemnum")
      // TODO: Need to pass class name to elastislide plug-in!!!  Once we can
      // do that then we can remove it from the wrapper and scale the larger
      // post images into view!
    });

    $elastislideWrapper = $postImages.closest("elastislide-wrapper");
    $elastislideWrapper.removeClass("minimized");
  }
};