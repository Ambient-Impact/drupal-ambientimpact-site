// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu - Overlay
// -----------------------------------------------------------------------------

AmbientImpact.on(['overlay'], function(aiOverlay) {
AmbientImpact.addComponent('siteThemeMenuPrimaryOverlay', function(
  siteThemeMenuPrimaryOverlay, $
) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeMenuPrimaryOverlay';

  /**
   * The primary menu overlay class.
   *
   * @type {String}
   */
  const overlayBaseClass = 'region-primary-menu-overlay';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryOverlay',
    'ambientimpact-site-theme-menu-primary-overlay',
    '.layout-container',
    function(context, settings) {

      /**
       * The layout container jQuery collection.
       *
       * @type {jQuery}
       */
      let $layoutContainer = $(this);

      /**
       * The primary menu region's overlay jQuery collection.
       *
       * @type {jQuery}
       */
      let $overlay = aiOverlay.create();

      /**
       * The primary menu region jQuery collection.
       *
       * @type {jQuery}
       */
      let $primaryMenuRegion = $layoutContainer.find('.region-primary-menu');

      $overlay
        .addClass(overlayBaseClass)
        .prependTo($layoutContainer);

      $primaryMenuRegion
        .on('menuDropDownOpened.' + eventNamespace, function(event, data) {
          $overlay[0].aiOverlay.show();
        })
        .on('menuDropDownAllClosed.' + eventNamespace, function(event, data) {
          $overlay[0].aiOverlay.hide();
        });

      /**
       * Data object for less duplicate code in detach.
       *
       * @type {Object}
       */
      this.siteThemeMenuPrimaryOverlay = {
        $primaryMenuRegion: $primaryMenuRegion,
        $overlay:           $overlay
      };

    },
    function(context, settings, trigger) {

      let data = this.siteThemeMenuPrimaryOverlay;

      data.$overlay[0].aiOverlay.destroy();

      data.$primaryMenuRegion.off([
        'menuDropDownOpened.' + eventNamespace,
        'menuDropDownAllClosed.' + eventNamespace,
      ].join(' '));

      delete this.siteThemeMenuPrimaryOverlay;

    }

  );

});
});
