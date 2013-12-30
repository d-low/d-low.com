window.dlow = {

  initialize: function() {
    
    //
    // Initialize site wide common functionality
    //

    $(".button")
      .on("touchstart", $.proxy(this.el_touchStart, this))
      .on("touchend", $.proxy(this.el_touchEnd, this))
      .on("touchcancel", $.proxy(this.el_touchCancel, this));

    // 
    // Initialize page specific functionality
    //

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
  },


  // --------------------------------------------------------------------------
  // Common Mobile Event Handling Methods
  // --------------------------------------------------------------------------

  /**
   * @description Add the tapped class to the element when the touchstart event 
   * fires so that our CSS can reverse the gradient (if required).
   */
  el_touchStart: function(e) {
    $(e.target).closest(".button").addClass("tapped");
  },

  /**
   * @description Remove the tapped class from the element when the touchend 
   * event fires so that our CSS can change back to the normal gradient.
   */
  el_touchEnd: function(e) {
    $(e.target).closest(".button").removeClass("tapped");
  },

  /**
   * @description Remove the tapped class from the element when the touchcancel
   * event fires so that our CSS can change back to the normal gradient.
   */
  el_touchCancel: function(e) { 
    $(e.target).closest(".button").removeClass("tapped");
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