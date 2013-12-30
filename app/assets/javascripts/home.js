/**
 * @description The home object defines the behavior for the home page of the site.
 */
window.dlow.home = {

  /**
   * Element handles and data
   */

  $welcomeSection: null,
  $welcomeSectionHeader: null,

  heights: {
    welcomeSection: 0,
    welcomeSectionHeader: 0
  },

  resize_timeout: null,

  /**
   * @description Initialize home page specific events.
   */
  initialize: function() {

    //
    // Get element handles
    //

    this.$welcomeSection = $("#welcome-section");
    this.$welcomeSectionHeader = $("#welcome-section-header");
  
    //
    // Update sizing, get heights, and set header opacity
    //

    this.setWelcomeSectionHeight();
    this.getHeights();
    this.updateWelcomeSectionHeaderOpacity();

    // 
    // Event handlers
    //
    
    $(window).resize($.proxy(this.window_resize, this));
    $(window).scroll($.proxy(this.window_scroll, this));
  },


  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  /**
   * @description Upon the last window resize event firing we'll set our intro
   * container height, update our heights, and then the navigation positioning.
   */
  window_resize: function() { 
    var self = this;

    var fResize = function() { 
      self.setWelcomeSectionHeight();
      self.getHeights();
    };  

    window.clearTimeout(this.resize_timeout);
    this.resize_timeout = window.setTimeout(fResize, 100);
  },

  /**
   * @description Handle the onscroll events to liven up the home page.
   */
  window_scroll: function() { 
    if (this.isWelcomeSectionVisible()) {
      this.updateWelcomeSectionBackground();
      this.updateWelcomeSectionHeaderOpacity();
    }
  },


  // --------------------------------------------------------------------------
  // Positioning Methods
  // --------------------------------------------------------------------------

  /**
   * @description Get the heights of our primary elements.
   */
  getHeights: function() {
    this.heights.welcomeSection = this.$welcomeSection.height();
    this.heights.welcomeSectionHeader = this.$welcomeSectionHeader.height();
  },

  /**
   * @description Set the height of the welcome section element to be the height 
   * of the view port so that the background image on the intro container, and 
   * perhaps others, covers the viewport properly.  This method will be called 
   * after the last window resize event.
   */
  setWelcomeSectionHeight: function() { 
    var height = $(window).height();
    this.$welcomeSection.css("height", height + "px");
  },

  /**
   * @description The welcome section is visible when the window's scroll top
   * is less than or equal to the height of the welcome section.
   */
  isWelcomeSectionVisible: function() { 
   return $(window).scrollTop() <= this.heights.welcomeSection;
  },


  // --------------------------------------------------------------------------
  // Effects Methods
  // --------------------------------------------------------------------------

  /**
   * @description Update the background position of the welcome section so that
   * its contents scroll away faster than the background image.  This is a 
   * simple parallax scrolling technique.
   */
  updateWelcomeSectionBackground: function() { 
    var scrollTop = $(window).scrollTop();
    var yPos = -(scrollTop / 10);
    var coords = '50% '+ yPos + 'px';

    this.$welcomeSection.css({"background-position": coords });
  },

  /**
   * @description Update the opacity of the intro header as we scroll down the 
   * page so that it fades away as the intro container is scrolled out of view.
   */
  updateWelcomeSectionHeaderOpacity: function() { 

    var scrollTop = $(window).scrollTop();
    var scrollRange = this.heights.welcomeSection - this.heights.welcomeSectionHeader;
    var opacity = Number((100 - (scrollTop / scrollRange * 100)) / 100).toFixed(2);

    opacity = opacity < 0 ? 0 : opacity;

    this.$welcomeSectionHeader.css("opacity", opacity);

    // The header needs to be hidden (dislay: none) when it is no longer 
    // visible, meaning content below it has been scrolled into view, so that 
    // it doesn't sit on top of now visible content preventing the user from 
    // interacting with it.

    if (opacity == 0) {
      this.$welcomeSectionHeader.addClass("hidden");
    }
    else {
      this.$welcomeSectionHeader.removeClass("hidden");
    }
  }
};