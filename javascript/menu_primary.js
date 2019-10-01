// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu
// -----------------------------------------------------------------------------

AmbientImpact.on('headroom', function(aiHeadroom, $) {
AmbientImpact.addComponent('siteThemeMenuPrimaryHeadroom', function(
  themeMenu, $
) {
  'use strict';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryHeadroom',
    'ambientimpact-site-theme-menu-primary-headroom',
    '.layout-container',
    function(context, settings) {
      var $header       = $('header[role=banner]', context),
          $primaryMenu  = $('.region-primary-menu', context);

      aiHeadroom.init($primaryMenu);

      // This indicates that the menu bar is sticky, so to
      // sync the header with it.
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
        'headroomPin.aiThemeMenu',
        'headroomTop.aiThemeMenu',
      ].join(' '), function(event) {
        $header
          .addClass('header--pinned')
          .removeClass('header--unpinned');
      }).on('headroomUnpin.aiThemeMenu', function(event) {
        $header
          .addClass('header--unpinned')
          .removeClass('header--pinned');
      });
    },
    function(context, settings, trigger) {
      var $header       = $('header[role=banner]', context),
          $primaryMenu  = $('.region-primary-menu', context),
          primaryMenu   = $primaryMenu[0];

      $primaryMenu.on('headroomDestroy.aiThemeMenu', function(event) {
        $header.removeClass([
          'header--pinned',
          'header--unpinned',
        ].join(' '));
      })

      // Destroy the Headroom instance if found.
      if (
        AmbientImpact.objectPathExists('headroom.destroy', primaryMenu) &&
        typeof primaryMenu.headroom.destroy === 'function'
      ) {
        primaryMenu.headroom.destroy();
      }

      $primaryMenu.off([
        'headroomPin.aiThemeMenu',
        'headroomUnpin.aiThemeMenu',
        'headroomDestroy.aiThemeMenu',
      ].join(' '));

      $header.removeClass('header--menu-bar-sticky');
    }
  );
});
});

// Add overflow and drop-down support/improvements to the primary menu.
AmbientImpact.on(['menuOverflow', 'menuDropDown'], function(
  aiMenuOverflow, aiMenuDropDown
) {
AmbientImpact.addComponent('siteThemeMenuPrimary', function(
  siteThemeMenuPrimary, $
) {
  'use strict';

  /**
   * Class applied to the primary menu region when it has a menu open.
   *
   * @type {String}
   */
  var regionHasMenuOpenClass = 'region-primary-menu--has-menu-open';

  /**
   * The primary menu overlay base class.
   *
   * @type {String}
   */
  var overlayBaseClass = 'region-primary-menu-overlay';

  /**
   * The primary menu overlay BEM modifier class when a sub-menu is open.
   *
   * @type {String}
   */
  var overlayOpenClass = overlayBaseClass + '--menu-is-open';

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimary',
    'ambientimpact-site-theme-menu-primary',
    '.layout-container',
    function(context, settings) {
      /**
       * The layout container, wrapped in a jQuery object.
       *
       * @type {jQuery}
       */
      var $layoutContainer = $(this);

      /**
       * The primary menu region, wrapped in a jQuery object.
       *
       * @type {jQuery}
       */
      var $primaryMenuRegion = $layoutContainer.find('.region-primary-menu');

      /**
       * The menu elements we're attaching to, wrapped in a jQuery collection.
       *
       * Note that this explicitly targets only the top-level menus.
       *
       * @type {jQuery}
       */
      var $menus = $primaryMenuRegion.find('.block-menu > .menu');

      /**
       * The primary menu region's overlay, wrapped in a jQuery object.
       *
       * @type {jQuery}
       */
      var $overlay = $('<div></div>');

      for (var i = $menus.length - 1; i >= 0; i--) {
        aiMenuOverflow.attach($menus[i]);
        aiMenuDropDown.attach($menus[i]);
      }

      /**
       * Headroom unpin event handler; closes open menus on Headroom unpin.
       *
       * This automatically closes drop-down menus if the menu bar becomes
       * unpinned, which means it has transitioned upwards off screen.
       *
       * @param {jQuery.Event} event
       *   The jQuery event object.
       */
      var headroomUnpinHandler = function(event) {
        for (var i = $menus.length - 1; i >= 0; i--) {
          var $menu = $menus.eq(i);

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

          var $items = $menu.find('.menu-item--menu-open');

          for (var i = 0; i < $items.length; i++) {
            if ('aiMenuDropDown' in $items[i]) {
              $items[i].aiMenuDropDown.close();
            }
          }
        }
      };

      $overlay
        .addClass(overlayBaseClass)
        .prependTo($layoutContainer);

      $primaryMenuRegion
        // This automatically closes drop-down menus if the menu bar becomes
        // unpinned, which means it has transitioned upwards off screen.
        //
        // Note that the immerseEnter event is not currently implemented as it
        // usually happens when focus is lost by the open menu, thus closing it
        // automatically.
        .on('headroomUnpin.aiSiteThemeMenuPrimary', headroomUnpinHandler)

        // Add and remove classes on the region and the overlay when a menu is
        // opened or closed, respectively.
        .on('menuDropDownOpened.aiSiteThemeMenuPrimary', function(event, data) {
          $primaryMenuRegion.addClass(regionHasMenuOpenClass);

          $overlay.addClass(overlayOpenClass);
        })
        .on('menuDropDownClosed.aiSiteThemeMenuPrimary', function(event, data) {
          $primaryMenuRegion.removeClass(regionHasMenuOpenClass);

          $overlay.removeClass(overlayOpenClass);
        });

      // Save all our jQuery collections to an object on the layout container
      // for detachment.
      this.siteThemeMenuPrimary = {
        $layoutContainer:   $layoutContainer,
        $primaryMenuRegion: $primaryMenuRegion,
        $menus:             $menus,
        $overlay:           $overlay
      };
    },
    function(context, settings, trigger) {
      var data = this.siteThemeMenuPrimary;

      data.$primaryMenuRegion
        .off([
          'headroomUnpin.aiSiteThemeMenuPrimary',
          'menuDropDownOpened.aiSiteThemeMenuPrimary',
          'menuDropDownClosed.aiSiteThemeMenuPrimary',
        ].join(' '))
        .removeClass(regionHasMenuOpenClass);

      data.$overlay.remove();

      for (var i = data.$menus.length - 1; i >= 0; i--) {
        aiMenuOverflow.detach(data.$menus[i]);
        aiMenuDropDown.detach(data.$menus[i]);
      }

      delete this.siteThemeMenuPrimary;
    }
  );
});
});
