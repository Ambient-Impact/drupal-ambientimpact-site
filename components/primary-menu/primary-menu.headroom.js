// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu - Headroom.js
// -----------------------------------------------------------------------------

AmbientImpact.on('headroom', function(aiHeadroom, $) {
AmbientImpact.addComponent('siteThemeMenuPrimaryHeadroom', function(
  siteThemeMenuPrimaryHeadroom, $
) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeMenuPrimaryHeadroom';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryHeadroom',
    'ambientimpact-site-theme-menu-primary-headroom',
    '.layout-container',
    function(context, settings) {

      /**
       * The header region element jQuery collection.
       *
       * @type {jQuery}
       */
      let $header = $('header[role=banner]', context);

      /**
       * The primary menu region jQuery collection.
       *
       * @type {jQuery}
       */
      let $primaryMenu  = $('.region-primary-menu', context);

      aiHeadroom.init($primaryMenu);

      // This indicates that the menu bar is sticky, so to sync the header with
      // it.
      $header.addClass('header--menu-bar-sticky');

      // Add/remove classes on header to sync it with the menu bar Headroom
      // state.
      //
      // Note that we have to bind to both the pin and top events to set the
      // header as pinned, as the top event is required to ensure that the
      // header doesn't get stuck in its unpinned state if the user scrolls
      // upwards quickly in a mobile browser where the browser chrome is hidden
      // and then shown about the time the the menu bar goes from unpinned to
      // pinned - this has been observed to happen in both Firefox and Chrome on
      // Android. This may be due to the menu bar being pinned and unpinned two
      // or more times due to the changing viewport top. This is not a perfect
      // solution, as the header can be seen to get out of sync with the menu
      // bar briefly before transitioning into its expected location, but it
      // works for now.
      $primaryMenu.on([
        'headroomPin.' + eventNamespace,
        'headroomTop.' + eventNamespace,
      ].join(' '), function(event) {
        $header
          .addClass('header--pinned')
          .removeClass('header--unpinned');
      }).on('headroomUnpin.' + eventNamespace, function(event) {
        $header
          .addClass('header--unpinned')
          .removeClass('header--pinned');
      });

    },
    function(context, settings, trigger) {

      /**
       * The header region element jQuery collection.
       *
       * @type {jQuery}
       */
      let $header = $('header[role=banner]', context);

      /**
       * The primary menu region jQuery collection.
       *
       * @type {jQuery}
       */
      let $primaryMenu  = $('.region-primary-menu', context);

      /**
       * The primary menu region element.
       *
       * @type {HTMLElement}
       */
      let primaryMenu = $primaryMenu[0];

      $primaryMenu.on('headroomDestroy.' + eventNamespace, function(event) {
        $header.removeClass([
          'header--pinned',
          'header--unpinned',
        ]);
      })

      // Destroy the Headroom instance if found.
      if (AmbientImpact.objectPathExists('headroom.destroy', primaryMenu)) {
        primaryMenu.headroom.destroy();
      }

      $primaryMenu.off([
        'headroomPin.'  + eventNamespace,
        'headroomUnpin.'  + eventNamespace,
        'headroomDestroy.'  + eventNamespace,
      ].join(' '));

      $header.removeClass('header--menu-bar-sticky');

    }

  );

});
});
