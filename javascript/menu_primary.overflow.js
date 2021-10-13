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

      // Force an update if the Furore font load event is triggered as it's used
      // for the menu items.
      $(document).on('fontloaded.' + eventNamespace, function(
        event, fontMachineName
      ) {

        if (fontMachineName !== 'furore') {
          return;
        }

        for (let i = $menus.length - 1; i >= 0; i--) {
          $menus[i].aiMenuOverflow.update(true);
        }

      });

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

      $(document).off('fontloaded.' + eventNamespace);

      let data = this.siteThemeMenuPrimaryOverflow;

      for (let i = 0; i < data.$menus.length; i++) {
        aiMenuOverflow.detach(data.$menus[i]);
      }

      delete this.siteThemeMenuPrimaryOverflow;

    }

  );

});
});
