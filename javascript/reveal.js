// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Reveal
// -----------------------------------------------------------------------------

// The primary purpose of this is to trigger a 'siteRevealed' event when CSS
// animations that reveal the site on load are complete or nearly complete for
// use by other components.

AmbientImpact.onGlobals(['Number.isNaN', 'Number.parseFloat'], function() {
AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('siteThemeReveal', function(siteThemeReveal, $) {

  'use strict';

  /**
   * Name of the data object for the detach callback.
   *
   * @type {String}
   */
  const dataObjectName = 'AmbientImpactSiteThemeReveal';

  /**
   * Name of the CSS custom property containing the reveal duration.
   *
   * @type {String}
   */
  const durationPropertyName = '--site-reveal-duration';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeReveal';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Name of the event triggered when the site is revealed.
   *
   * @type {String}
   */
  const siteRevealedEventName = 'siteRevealed';

  this.addBehaviour(
    'AmbientImpactSiteThemeReveal',
    'ambientimpact-site-theme-reveal',
    'body',
    function(context, settings) {

      /**
       * The <body> element.
       *
       * @type {HTMLElement}
       */
      let body = this;

      /**
       * The <body> element jQuery collection.
       *
       * @type {jQuery}
       */
      let $body = $(this);

      // Bail if the site is in maintenance mode.
      if ($body.hasClass('maintenance-page')) {
        return;
      }

      // Attempt to read and parse the reveal duration CSS custom property.
      fastdom.measure(function() {

        /** @type {String} Either a string value or an empty string if not defined. */
        let propertyValue = getComputedStyle(body).getPropertyValue(
          durationPropertyName
        ).trim();

        if (propertyValue.length === 0) {
          return false;
        }

        /** @type {Number|NaN} The parsed duration as a float or NaN. */
        let duration = Number.parseFloat(propertyValue);

        if (Number.isNaN(duration)) {
          return false;
        }

        // If the duration value is not in milliseconds, it's as seconds so we
        // have to convert it.
        if (propertyValue.slice(-2) !== 'ms') {
          return duration * 1000;
        }

        return duration;

      }).then(function(duration) {

        // Bail if we couldn't get a valid duration.
        if (duration === false) {
          return;
        }

        /**
         * The data object for the detach callback.
         *
         * @type {Object}
         */
        let data = {
          eventTriggered:       false,
          $revealElement:       null,
          animationendHandler:  null,
          setTimeoutId:         null,
        };

        if ($body.hasClass('path-frontpage')) {
          data.$revealElement = $('.layout-container', context);

        } else {
          data.$revealElement = $('.region-highlighted', context);
        }

        /**
         * animationend event handler.
         *
         * @param {jQuery.Event} event
         *   The event object.
         */
        data.animationendHandler = function(event) {

          if (event.target !== this) {
            return;
          }

          data.$revealElement
            .off('animationend.' + eventNamespace)
            .trigger(siteRevealedEventName);

          data.eventTriggered = true;

        };

        data.$revealElement.on(
          'animationend.' + eventNamespace,
          data.animationendHandler
        );

        // This ensures that the 'siteRevealed' event is triggered at least
        // once. If this behaviour is slow to attach, e.g. slow network
        // conditions, the animation may have already completed by this point.
        data.setTimeoutId = setTimeout(function() {

          if (data.eventTriggered === true) {
            return;
          }

          data.$revealElement
            .off('animationend.' + eventNamespace)
            .trigger(siteRevealedEventName);

          data.eventTriggered = true;

        }, duration + 100);

        body[dataObjectName] = data;

      });

    },
    function(context, settings, trigger) {

      if (!(dataObjectName in this)) {
        return;
      }

      /**
       * The data object for the detach callback.
       *
       * @type {Object}
       */
      let data = this[dataObjectName];

      clearTimeout(data.setTimeoutId);

      data.$revealElement.off(
        'animationend.' + eventNamespace,
        data.animationendHandler
      );

    }

  );

});
});
});
