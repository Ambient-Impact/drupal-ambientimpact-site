// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu - Menu overflow
// -----------------------------------------------------------------------------

AmbientImpact.on(['menuOverflow'], function(aiMenuOverflow) {
AmbientImpact.addComponent('siteThemeMenuPrimaryOverflow', function(
  siteThemeMenuPrimaryOverflow, $
) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeMenuPrimaryOverflow';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryOverflow',
    'ambientimpact-site-theme-menu-primary-overflow',
    '.layout-container',
    function(context, settings) {

      /**
       * The menu elements we're attaching to in a jQuery collection.
       *
       * Note that this explicitly targets only the top-level menus.
       *
       * @type {jQuery}
       */
      let $menus = $(this).find('.region-primary-menu .block-menu > .menu');

      for (let i = 0; i < $menus.length; i++) {
        aiMenuOverflow.attach($menus[i]);
      }

      /**
       * Data object for less duplicate code in detach.
       *
       * @type {Object}
       */
      this.siteThemeMenuPrimaryOverflow = {
        $menus: $menus
      };

    },
    function(context, settings, trigger) {

      let data = this.siteThemeMenuPrimaryOverflow;

      for (let i = 0; i < data.$menus.length; i++) {
        aiMenuOverflow.detach(data.$menus[i]);
      }

      delete this.siteThemeMenuPrimaryOverflow;

    }

  );

});
});
