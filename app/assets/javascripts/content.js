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
    // Initialize event handlers
    //

    $(".js-post-images").each(function() {
      $(this).elastislide({
        minItems: 2
      });
    });

    $(".js-post-content-toggle").on("click", $.proxy(this.contentToggle_click, this));

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
  }
};