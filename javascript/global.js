// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Global JavaScript
// -----------------------------------------------------------------------------

/**
 * Provides a :focus-within polyfill.
 *
 * Note that ally.style.focusWithin doesn't have an option to limit to certain
 * elements, so this is global.
 *
 * This is used for the following:
 * - Primary menu item indicators.
 *
 * @see https://allyjs.io/api/style/focus-within.html
 */
AmbientImpact.onGlobals('ally.style.focusWithin', function() {
AmbientImpact.addComponent('siteThemeFocusWithin', function(
  siteThemeFocusWithin, $
) {
  'use strict';

  var allyFocusWithinHandleDataName = 'ally-focus-within-handle';

  this.addBehaviour(
    'AmbientImpactSiteThemeFocusWithin',
    'ambientimpact-site-theme-focus-within',
    'body',
    function(context, settings) {
      $(this).data(allyFocusWithinHandleDataName, ally.style.focusWithin());
    },
    function(context, settings, trigger) {
      var $this   = $(this),
          handle  = $this.data(allyFocusWithinHandleDataName);

      if (
        typeof handle !== 'undefined' &&
        'disengage' in handle &&
        typeof handle.disengage === 'function'
      ) {
        handle.disengage();

        $this.removeData(allyFocusWithinHandleDataName);
      }
    }
  );
});
});
