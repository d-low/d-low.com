/**
 * @description The content object defines the behavior for the content page of
 * the site.
 */
window.dlow.content = {

  /**
   * @description Initialize home page specific events.
   */
  initialize: function() {
    $(".js-post-images").each(function() {
      $(this).elastislide({
        minItems: 2
      });
    });
  }
};