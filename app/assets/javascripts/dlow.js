window.dlow = {

  initialize: function() {
    // TODO: Initialize site wide common functionality here...
    this.initializePage();
  },

  /**
   * @description Initialize page specific JavaScript.  We're using the garber-irish 
   * technique to invoke page specific JavaScript using data attributes on the body
   * element. 
   * @see http://viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution
   */
  initializePage: function() {

    var $body = $("body");
    var controller = $body.data("controllername");
    var action = $body.data("controlleraction");

    if (this[controller]) {
      if (typeof(this[controller].initialize) === "function") {
        this[controller].initialize();
      }

      if (typeof(this[controller][action]) === "function") {
        this[controller][action]();
      }
    }
  }
};

/**
 * @description The site wide document ready method intitializes the dlow 
 * object which is responsible for setting up all behavior for pages.  There 
 * will be NO other document.ready event handers in page specific JavaScript.
 */
$(document).ready(function() {
  dlow.initialize();
});