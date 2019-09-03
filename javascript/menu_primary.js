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

      // Add/remove classes on header to sync it with the menu
      // bar Headroom stuff.
      $primaryMenu.on('headroomPin.aiThemeMenu', function(event) {
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

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimary',
    'ambientimpact-site-theme-menu-primary',
    '.region-primary-menu .block-menu > .menu',
    function(context, settings) {
      aiMenuOverflow.attach(this);
      aiMenuDropDown.attach(this);

      var menu = this;
      var $menu = $(this);

      // This automatically closes drop-down menus if the menu bar becomes
      // unpinned, which means it has transitioned upwards off screen.
      //
      // Note that the immerseEnter event is not currently implemented as it
      // usually happens when focus is lost by the open menu, thus closing it
      // automatically.
      $menu.closest('.region-primary-menu')
        .on('headroomUnpin.aiSiteThemeMenuPrimaryDropDown', function(event) {
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
            return;
          }

          var $items = $menu.find('.menu-item--menu-open');

          for (var i = 0; i < $items.length; i++) {
            if ('aiMenuDropDown' in $items[i]) {
              $items[i].aiMenuDropDown.close();
            }
          }
        });
    },
    function(context, settings, trigger) {
      $(this).closest('.region-primary-menu')
        .off('headroomUnpin.aiSiteThemeMenuPrimaryDropDown');

      aiMenuOverflow.detach(this);
      aiMenuDropDown.detach(this);
    }
  );
});
});
