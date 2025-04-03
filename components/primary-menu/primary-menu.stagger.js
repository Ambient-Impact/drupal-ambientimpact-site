// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Primary menu - Stagger
// -----------------------------------------------------------------------------

AmbientImpact.on(['fastdom'], function(aiFastDom) {
AmbientImpact.addComponent('siteThemeMenuPrimaryStagger', function(
  siteThemeMenuPrimaryStagger, $
) {

  'use strict';

  /**
   * Our event namespace.
   *
   * @type {String}
   */
  const eventNamespace = 'AmbientImpactSiteThemeMenuPrimaryStagger';

  /**
   * FastDom instance.
   *
   * @type {FastDom}
   */
  const fastdom = aiFastDom.getInstance();

  /**
   * Sub-menu item reveal stagger custom property name.
   *
   * @type {String}
   */
  const customPropertyName = '--menu-item-reveal-transition-delay';

  /**
   * Set sub-menu menu item reveal stagger custom properties.
   *
   * @param {HTMLElement} parentMenuItem
   *   The parent menu item that has a .menu as a direct descendent,
   *   containing one or more .menu-item elements.
   */
  function setCustomProperties(parentMenuItem) {

    /**
     * Sub-menu items to apply the custom properties to.
     *
     * @type {jQuery}
     */
    let $menuItems = $(parentMenuItem).find('> .menu > .menu-item');

    for (let i = $menuItems.length - 1; i >= 0; i--) {
      $menuItems[i].style.setProperty(
        customPropertyName,
        $menuItems.length - i
      );
    }

  };

  /**
   * Remove sub-menu menu item reveal stagger custom properties.
   *
   * @param {HTMLElement} parentMenuItem
   *   The parent menu item that has a .menu as a direct descendent,
   *   containing one or more .menu-item elements.
   */
  function removeCustomProperties(parentMenuItem) {

    /**
     * Sub-menu items to remove the custom properties from.
     *
     * @type {jQuery}
     */
    let $menuItems = $(parentMenuItem).find('> .menu > .menu-item');

    for (let i = $menuItems.length - 1; i >= 0; i--) {
      $menuItems[i].style.removeProperty(customPropertyName);
    }

  }

  this.addBehaviour(
    'AmbientImpactSiteThemeMenuPrimaryStagger',
    'ambientimpact-site-theme-menu-primary-stagger',
    '.layout-container',
    function(context, settings) {

      /**
       * The menu elements we're attaching to, wrapped in a jQuery collection.
       *
       * Note that this explicitly targets only the top-level menus.
       *
       * @type {jQuery}
       */
      let $menus = $(this).find('.region-primary-menu .block-menu > .menu');

      // Add stagger custom properties once the menu overflow has been
      // attached.
      $menus.one('menuOverflowAttached.' + eventNamespace, function(event) {

        fastdom.mutate(function() {
          $menus.children('.menu-item--expanded').each(function() {
            setCustomProperties(this);
          });
        });

      });

      /**
       * Data object for less duplicate code in detach.
       *
       * @type {Object}
       */
      this.siteThemeMenuPrimaryStagger = {
        $menus: $menus
      };

    },
    function(context, settings, trigger) {

      let data = this.siteThemeMenuPrimaryStagger;

      let layoutContainer = this;

      data.$menus.off('menuOverflowAttached.' + eventNamespace);

      fastdom.mutate(function() {

        data.$menus.children('.menu-item--expanded').each(function() {
          removeCustomProperties(this);
        });

      }).then(function() {

        delete layoutContainer.siteThemeMenuPrimaryStagger;

      });

    }

  );

});
});
