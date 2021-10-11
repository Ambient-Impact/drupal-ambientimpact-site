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
AmbientImpact.onGlobals(['Modernizr.customproperties'], function() {
AmbientImpact.on(['menuOverflow', 'menuDropDown', 'overlay'], function(
  aiMenuOverflow, aiMenuDropDown, aiOverlay
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
   * The primary menu overlay class.
   *
   * @type {String}
   */
  var overlayBaseClass = 'region-primary-menu-overlay';

  /**
   * Primary menu sub-menu item reveal stagger custom property name.
   *
   * @type {String}
   */
  var itemStaggerCustomPropertyName = '--menu-item-reveal-transition-delay';

  if (Modernizr.customproperties === true) {
    /**
     * Set sub-menu menu item reveal stagger custom properties.
     *
     * This is defined if Modernizr.customproperties === true.
     *
     * @param {HTMLElement} parentMenuItem
     *   The parent menu item that has a .menu as a direct descendent,
     *   containing one or more .menu-item elements.
     */
    var setItemStaggerCustomProperties = function(parentMenuItem) {
      var $menuItems = $(parentMenuItem).find('> .menu > .menu-item');

      for (var i = $menuItems.length - 1; i >= 0; i--) {
        $menuItems[i].style.setProperty(
          itemStaggerCustomPropertyName,
          $menuItems.length - i
        );
      }
    };
  } else {
    /**
     * Dummy set sub-menu menu item reveal stagger custom properties.
     *
     * This is defined once if Modernizr.customproperties !== true to avoid
     * errors and reduce the work we have to do when a menu is opened, i.e. not
     * check when the menu is opening.
     *
     * @param {HTMLElement} parentMenuItem
     *   The parent menu item that has a .menu as a direct descendent,
     *   containing one or more .menu-item elements.
     */
    var setItemStaggerCustomProperties = function(parentMenuItem) {};
  }

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
      var $overlay = aiOverlay.create();

      /**
       * jQuery collection containing zero or more open menu items.
       *
       * This is used to ensure the overlay is not hidden if a menu opens before
       * another closes.
       *
       * @type {jQuery}
       */
      var $openMenuItems = $();

      $menus.one(
        'menuOverflowAttached.aiSiteThemeMenuPrimary',
      function(event) {

        // Wait for the menu overflow component to have finished attaching to
        // attach the menu drop-down component.
        aiMenuDropDown.attach(this);

        // Add stagger custom properties once the menu overflow has been
        // attached.
        $(this).children('.menu-item--expanded').each(function() {
          setItemStaggerCustomProperties(this);
        });

      });

      for (var i = 0; i < $menus.length; i++) {
        aiMenuOverflow.attach($menus[i]);
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

          $overlay[0].aiOverlay.show();

          // Add the just opened menu item to $openMenuItems.
          $openMenuItems = $openMenuItems.add(event.target);
        })
        .on('menuDropDownClosed.aiSiteThemeMenuPrimary', function(event, data) {
          // Remove the menu item that just closed from $openMenuItems.
          $openMenuItems = $openMenuItems.not(event.target);

          // If there are still menu items in $openMenuItems, return without
          // hiding the overlay. This can occur if the user quickly hovers over
          // another item while one is closing, so the new item would be open
          // when the previous triggers its close event.
          if ($openMenuItems.length > 0) {
            return;
          }

          $primaryMenuRegion.removeClass(regionHasMenuOpenClass);

          $overlay[0].aiOverlay.hide();
        });

      // Force an update if the Furore font load event is triggered as it's used
      // for the menu items.
      $(document).on('fontloaded.aiSiteThemeMenuPrimary', function(
        event, fontMachineName
      ) {

        if (fontMachineName !== 'furore') {
          return;
        }

        for (var i = $menus.length - 1; i >= 0; i--) {
          $menus[i].aiMenuOverflow.update(true);
        }

      });

      // Force an update so the overflow takes any changed toggle width into
      // account.
      //
      // @todo Remove this once the menu overflow component reliably accounts
      //   for toggle swapping.
      $menus.on(
        'menuOverflowToggleContentAfterUpdate.aiSiteThemeMenuPrimary',
      function(event) {
        this.aiMenuOverflow.update(true);
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

      $(document).off('fontloaded.aiSiteThemeMenuPrimary');

      var data = this.siteThemeMenuPrimary;

      data.$primaryMenuRegion
        .off([
          'headroomUnpin.aiSiteThemeMenuPrimary',
          'menuDropDownOpened.aiSiteThemeMenuPrimary',
          'menuDropDownClosed.aiSiteThemeMenuPrimary',
        ].join(' '))
        .removeClass(regionHasMenuOpenClass);

      data.$overlay[0].aiOverlay.destroy();

      data.$menus
        .off([
          // Just in case this hasn't been triggered yet.
          'menuOverflowAttached.aiSiteThemeMenuPrimary',
          'menuOverflowToggleContentAfterUpdate.aiSiteThemeMenuPrimary'
        ].join(' '))
        .one(
          'menuOverflowDetached.aiSiteThemeMenuPrimary',
        function(event) {
          aiMenuDropDown.detach(this);
        });

      for (var i = 0; i < $menus.length; i++) {
        aiMenuOverflow.detach(data.$menus[i]);
      }

      var $secondLevelMenuItems =
        data.$menus.find('> .menu-item > .menu > .menu-item');

      // Remove any menu item stagger reveal custom properties on menu items.
      for (var i = $secondLevelMenuItems.length - 1; i >= 0; i--) {
        $secondLevelMenuItems[i].style
          .removeProperty(itemStaggerCustomPropertyName);
      }

      delete this.siteThemeMenuPrimary;
    }
  );
});
});
});
