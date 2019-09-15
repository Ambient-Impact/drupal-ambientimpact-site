// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Project node media
// -----------------------------------------------------------------------------

// This solves an issue in Firefox on Android where the number of project images
// on the /porfolio page causes the position: sticky; functionality on the
// primary menu bar to be extremely laggy and not synced with scrolling -
// probably because it's not being passed off to the GPU as it is on other pages
// but done on the CPU. We use the Intersection Observer API to add or remove a
// class from project images field items depending on whether they're in view or
// not, which then applies visibility: hidden; in
// ../stylesheets/global/_field_media.scss
//
// @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

AmbientImpact.onGlobals(['IntersectionObserver'], function() {
AmbientImpact.addComponent('siteThemeProjectMedia', function(
  siteThemeProjectMedia, $
) {
  'use strict';

  /**
   * Selector to find project image field items.
   *
   * @type {String}
   */
  var fieldItemSelector =
    '.node--type-project .field--name-field-project-images .field__item';

  /**
   * Class to apply to project image field items when they're off screen.
   *
   * @type {String}
   */
  var fieldItemOffScreenClass = 'field__item--off-screen';

  /**
   * Options to pass to the IntersectionObserver.
   *
   * @type {Object}
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
   */
  var intersectionObserverOptions = {};

  /**
   * IntersectionObserver callback; toggles project image field item class.
   *
   * @param {Array} entries
   *   An array of IntersectionObserverEntry objects, each representing one
   *   threshold which was crossed
   *
   * @param {IntersectionObserver} observer
   *   The IntersectionObserver for which the callback is being invoked.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   *   Since all browsers that support IntersectionObserver also support
   *   Element.classList, we can safely use the latter rather than jQuery as it
   *   should be a bit quicker.
   */
  function intersectionObserverCallback(entries, observer) {
    // Native reverse for loop for performance, as it doesn't have the overhead
    // of calling a callback function for each iteration.
    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].isIntersecting === false) {
        entries[i].target.classList.add(fieldItemOffScreenClass);
      } else {
        entries[i].target.classList.remove(fieldItemOffScreenClass);
      }
    }
  };

  this.addBehaviour(
    'AmbientImpactSiteThemeProjectMedia',
    'ambientimpact-site-theme-project-media',
    '.layout-container',
    function(context, settings) {
      /**
       * Object containing the IntersectionObserver instance and other settings.
       *
       * @type {Object}
       */
      var data = {
        intersectionObserver: new IntersectionObserver(
          intersectionObserverCallback,
          intersectionObserverOptions
        ),
        fieldItemSelector: fieldItemSelector
      };

      /**
       * The layout container, wrapped in a jQuery collection.
       *
       * @type {jQuery}
       */
      var $this = $(this);

      /**
       * All found project media field items, wrapped in a jQuery collection.
       *
       * @type {jQuery}
       */
      var $mediaFieldItems = $this.find(data.fieldItemSelector);

      // Start observing each found field item. We use a native reverse for loop
      // for performance, as it doesn't have the overhead of calling a callback
      // function for each iteration.
      for (var i = 0; i < $mediaFieldItems.length; i++) {
        data.intersectionObserver.observe($mediaFieldItems[i]);
      }

      // Attach the data object to the layout container so that it can be
      // retrieved later during detachment.
      this.siteThemeProjectMedia = data;
    },
    function(context, settings, trigger) {
      /**
       * Object containing the IntersectionObserver instance and other settings.
       *
       * @type {Object}
       */
      var data = this.siteThemeProjectMedia;

      /**
       * The layout container, wrapped in a jQuery collection.
       *
       * @type {jQuery}
       */
      var $this = $(this);

      /**
       * All found project media field items, wrapped in a jQuery collection.
       *
       * @type {jQuery}
       */
      var $mediaFieldItems = $this.find(data.fieldItemSelector);

      // Stop observing all elements being observed.
      data.intersectionObserver.disconnect();

      // Remove the off screen class from any field items that currently have
      // it.
      $mediaFieldItems.removeClass(fieldItemOffScreenClass);

      // Delete the property from the layout container as it's no longer needed.
      delete this.siteThemeProjectMedia;
    }
  );
});
});
