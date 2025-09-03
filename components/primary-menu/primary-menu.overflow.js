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
    ['unload', 'refreshless:cached-snapshot'],
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

      // The overflow measure shadow should not be cached by RefreshLess as it
      // can multiply and cause all sorts of weird breakages.
      //
      // @todo Remove this if/when we can reliably detach when delaying using
      //   FastDom before RefreshLess caches the page.
      $menus.siblings('.menu--overflow-measure-shadow').attr(
        'data-refreshless-temporary', true,
      );

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

      if (typeof data === 'undefined') {
        return;
      }

      for (let i = 0; i < data.$menus.length; i++) {
        aiMenuOverflow.detach(data.$menus[i]);
      }

      delete this.siteThemeMenuPrimaryOverflow;

    }

  );

});
});
