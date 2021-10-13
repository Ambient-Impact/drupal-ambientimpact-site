// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu - Menu drop down
// -----------------------------------------------------------------------------

AmbientImpact.on([
  'menuDropDown',
  'siteThemeMenuPrimaryOverflow',
], function(aiMenuDropDown, siteThemeMenuPrimaryOverflow) {
AmbientImpact.addComponent('siteThemeMenuPrimaryDropDown', function(
  siteThemeMenuPrimaryDropDown, $
) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeMenuPrimaryDropDown';

  /**
   * Class applied to the primary menu region when it has a menu open.
   *
   * @type {String}
   */
  const regionHasMenuOpenClass = 'region-primary-menu--has-menu-open';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryDropDown',
    'ambientimpact-site-theme-menu-primary-drop-down',
    '.layout-container',
    function(context, settings) {

      /**
       * The primary menu region jQuery collection.
       *
       * @type {jQuery}
       */
      let $primaryMenuRegion = $(this).find('.region-primary-menu');

      /**
       * The menu elements we're attaching to in a jQuery collection.
       *
       * Note that this explicitly targets only the top-level menus.
       *
       * @type {jQuery}
       */
      let $menus = $primaryMenuRegion.find('.block-menu > .menu');

      // Wait for the menu overflow component to have finished attaching to
      // attach the menu drop-down component.
      $menus.one('menuOverflowAttached.' + eventNamespace, function(event) {
        aiMenuDropDown.attach(this);
      });

      $primaryMenuRegion
        // This automatically closes drop-down menus if the menu bar becomes
        // unpinned, which means it has transitioned upwards off screen.
        //
        // Note that the immerseEnter event is not currently implemented as it
        // usually happens when focus is lost by the open menu, thus closing it
        // automatically.
        .on('headroomUnpin.' + eventNamespace, function(event) {

          for (let i = 0; i < $menus.length; i++) {

            let $menu = $menus.eq(i);

            // Don't close if the menu is in all overflow mode. This is a crude
            // heuristic to determine if the user is trying to scroll the menu
            // when it's scrollable. This is needed in Chrome on Android as it
            // does some clever stuff with viewport units so the browser chrome
            // isn't taken into account when it's shown or hidden.
            //
            // @todo A more robust version of this would check if the user is
            // touch dragging or scrolling on the menu itself and use that to
            // determine if we should hide or not.
            if ($menu.hasClass('menu--all-overflow')) {
              continue;
            }

            let $items = $menu.find('.menu-item--menu-open');

            for (let i = 0; i < $items.length; i++) {
              if ('aiMenuDropDown' in $items[i]) {
                $items[i].aiMenuDropDown.close();
              }
            }
          }
        })

        // Add and remove classes on the region and the overlay when a menu is
        // opened or closed, respectively.
        .on('menuDropDownOpened.' + eventNamespace, function(event, data) {
          $primaryMenuRegion.addClass(regionHasMenuOpenClass);
        })
        .on('menuDropDownAllClosed.' + eventNamespace, function(event, data) {
          $primaryMenuRegion.removeClass(regionHasMenuOpenClass);
        });

      // Save all our jQuery collections to an object on the layout container
      // for detachment.
      this.siteThemeMenuPrimaryOverflow = {
        $primaryMenuRegion: $primaryMenuRegion,
        $menus:             $menus
      };

    },
    function(context, settings, trigger) {

      let data = this.siteThemeMenuPrimaryOverflow;

      data.$primaryMenuRegion.off([
        'headroomUnpin.' + eventNamespace,
        'menuDropDownOpened.' + eventNamespace,
        'menuDropDownAllClosed.' + eventNamespace,
      ].join(' '))
      .removeClass(regionHasMenuOpenClass);

      data.$menus.off([
        // Just in case this hasn't been triggered yet.
        'menuOverflowAttached.' + eventNamespace,
      ].join(' '))
      .one('menuOverflowDetached.' + eventNamespace, function(event) {
        aiMenuDropDown.detach(this);
      });

      delete this.siteThemeMenuPrimaryOverflow;

    }

  );

});
});
