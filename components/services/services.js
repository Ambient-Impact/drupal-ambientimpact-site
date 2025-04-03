// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Services content
// -----------------------------------------------------------------------------

// This attempts to co-ordinate the services icon reveals so that the stagger/
// delays are removed for items that are not visible on load, allowing those
// items to animate in instantly when the user scrolls them into view.

// @todo Add the stagger back in if all items become visible at the same time
//   after being hidden initially on load.

// @todo Refactor this as a more general purpose component that can be applied
//   to any list of icons.

AmbientImpact.on([
  'contentVisibility', 'fastdom', 'siteThemeReveal',
], function(aiContentVisibility, aiFastDom, aiSiteThemeReveal) {
AmbientImpact.addComponent('siteThemeServices', function(siteThemeServices, $) {

  'use strict';

  /**
   * Name of the data object for the detach callback.
   *
   * @type {String}
   */
  const dataObjectName = 'AmbientImpactSiteThemeServices';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeServices';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Name of the services icon reveal delay CSS custom property.
   *
   * @type {String}
   */
  const revealDelayPropertyName = '--services-icon-reveal-delay';

  /**
   * Name of the services icon reveal stagger duration CSS custom property.
   *
   * @type {String}
   */
  const revealStaggerPropertyName = '--services-icon-reveal-stagger-duration';

  this.addBehaviour(
    'AmbientImpactSiteThemeServices',
    'ambientimpact-site-theme-services',
    '.layout-container',
    function(context, settings) {

      /**
       * The services container jQuery collection.
       *
       * @type {jQuery}
       */
      let $container = $('.services-overview', this);

      /**
       * The services items jQuery collection.
       *
       * @type {jQuery}
       */
      let $items = $('.services-overview__item', this);

      /**
       * Site reveal handler.
       *
       * @param {jQuery.Event} event
       *   The event object.
       */
      let siteRevealedHandler = function(event) {

        fastdom.mutate(function() {

          let $visibleItems = $items.filter(
            '.content-visibility-observe--visible'
          );

          let $hiddenItems = $items.not($visibleItems);

          for (let i = 0; i < $hiddenItems.length; i++) {
            $hiddenItems[i].style.setProperty(
              revealStaggerPropertyName,
              '0s'
            );
            $hiddenItems[i].style.setProperty(
              revealDelayPropertyName,
              '0s'
            );
          }

        });

      };

      $(this).on('siteRevealed.' + eventNamespace, siteRevealedHandler);

      /**
       * The data object for the detach callback.
       *
       * @type {Object}
       */
      this[dataObjectName] = {
        $items: $items,
        siteRevealedHandler: siteRevealedHandler,
      };

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

      $(this).off('siteRevealed.' + eventNamespace, data.siteRevealedHandler);

      fastdom.mutate(function() {

        for (let i = 0; i < data.$items.length; i++) {
          data.$items[i].style.removeProperty(revealStaggerPropertyName);
          data.$items[i].style.removeProperty(revealDelayPropertyName);
        }

      });

    }

  );

});
});
