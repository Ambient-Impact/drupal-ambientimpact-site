// -----------------------------------------------------------------------------
//   Ambient.Impact - Site theme - Project node titles
// -----------------------------------------------------------------------------

// This component uses <canvas> elements to dynamically resize project titles by
// the available width, keeping it all on one line, bypassing most of the usual
// quirks of native inline text.

// @todo Can the generated title images be cached somehow so that we only have
// to render them once? If it's possible to save the <canvas> image to
// localStorage, for example, they could be stored there, if we have the storage
// space for them.

// Requires window.matchMedia and <canvas> text support.
AmbientImpact.onGlobals(['matchMedia', 'Modernizr.canvastext'], function() {
AmbientImpact.on('font', function(aiFont, $) {

if (Modernizr.canvastext === false) {
  return;
}

// This is wrapped in a function as we need to wait for the Furore font to load
// if it isn't loaded yet; see after this function wrapper for invocation.
var addComponent = function() {
AmbientImpact.addComponent('siteThemeProjectTitle', function(
  themeProjectTitle, $
) {
  'use strict';

  var nodeTitleSelector = '.node--type-project .node__title .field--name-title',
      pageTitleSelector = '.page-title .field--name-title';

  /**
   * This returns the title selector based on whether this is a node page.
   *
   * @return {String}
   *   The title selector.
   */
  function getTitleSelector() {
    if (
      $('body').hasClass('page-node-type-project') &&
      !$('body').hasClass('page-node-edit')
    ) {
      return pageTitleSelector;
    } else {
      return nodeTitleSelector;
    }
  };

  this.addBehaviour(
    'AmbientImpactSiteThemeProjectTitle',
    'ambientimpact-site-theme-project-title',
    // '.layout-container',
    getTitleSelector(),
    function(context, settings) {
      var canvas    = document.createElement('canvas'),
          isOverflowCanvas  = false,
          context     = canvas.getContext('2d'),
          // This is the width attribute of the canvas element. Don't set it too
          // low, or it'll be pixelatted on high density displays
          canvasWidth   = 1200, // px
          // This value is removed from the left and right of the text, because
          // the Furore font has extra spacing and we want to have it flush with
          // the sides if possible. This is defined at the largest font size,
          // and is scaled down as the font size is, to the minimum font size
          widthClip   = 5.5, // px
          // This is the text content read out from the heading element
          text      = '',
          // This is the computed width of the text, as computed lower down.
          textWidth   = null,
          // Text colour.
          textColour    = $(this).css('color'),
          // Grab the font-family
          fontFamily    = $(this).css('font-family').split(',')[0],
          // This is the preferred font size, in pixels
          fontSizeMax   = Math.round(parseInt($(this).css('font-size'), 10) * 4),
          // This is the smallest font size we can size down to, in pixels
          fontSizeMin   = Math.round(
            parseInt($(this).css('font-size'), 10) *
            // Smaller screens get a larger minimum font size,
            // to compensate for the <canvas> being narrower, which
            // scales down the text
            (window.matchMedia('(min-width: 30em)').matches ? 1 : 3)
          ),
          // This is the calculated font size that will fit in the
          // space available
          fontSize    = fontSizeMax,
          // jQuery Title element
          $title      = $(this);

      canvas.width  = canvasWidth;
      canvas.height = fontSize;

      // Grab the text
      text = $.trim($title.contents().textNodes().text());

      $(canvas)
        // Wrap the title text nodes in the <canvas> element, as a fallback
        .append($title.contents().textNodes())
        // Set the title attribute for accessibility
        .attr('title', text)
        .appendTo($title);

      function setFontSize() {
        context.font = (fontSize) + 'px ' + fontFamily;
      }
      setFontSize();

      function setTextWidth() {
        textWidth = Math.ceil(context.measureText(text).width - widthClip);
      }
      setTextWidth();

      // If the computed width is wider than the <canvas>, keep trying
      // smaller sizes until we run out of cake (read: minimum is hit)
      while (textWidth > canvas.width && fontSize > fontSizeMin) {
        fontSize = fontSize - 0.1;
        setFontSize();
        setTextWidth();
      }
      // If we've hit the minimum font size and the text is still
      // wider than the canvas, add a class to indicate this
      if (textWidth > canvas.width) {
        $(this).closest('.node')
          .addClass('node--has-overflow-canvas-title');
        // Set this for the <body> class lower down
        isOverflowCanvas = true;
      }

      // Render the text
      context.fillText(text, Math.ceil(-widthClip * (fontSize / fontSizeMax)), canvas.height);

      // Add a class to indicate we have enhanced the title.
      $(this).closest('.node')
        .addClass('node--has-canvas-title');

      // Add a class to the <body> on standalone node pages to indicate
      // enhancement.
      $('.page-node-type-project')
        .addClass('page-node-type-project--has-canvas-title')
          // If we've hit the minimum font size and the text is still
          // wider than the canvas, add a class to indicate this
          .filter(function() {
            return isOverflowCanvas;
          })
          .addClass('page-node-type-project--has-overflow-canvas-title');
    },
    function(context, settings, trigger) {
      // Remove the <canvas> elements by unwrapping their
      // fallback content (which is the heading text).
      $(this).find('canvas')
        .contents()
          .unwrap();

      // Remove classes.
      var removeClasses = [
        // Node elements not on their own node pages.
        'node--has-canvas-title',
        'node--has-overflow-canvas-title',
        // <body> classes on node pages.
        'page-node-type-project--has-canvas-title',
        'page-node-type-project--has-overflow-canvas-title'
      ];
      for (var i = removeClasses.length - 1; i >= 0; i--) {
        $(this).closest('.' + removeClasses[i], context)
          .removeClass(removeClasses[i]);
      }
    }
  );
});
};

// Check if the Furore font is already loaded.
if (aiFont.isLoaded('furore')) {
  // If loaded, enhance the titles right away.
  addComponent();
} else {
  // If not loaded, bind to the 'fontloaded' event.
  $(window).on('fontloaded', function(event, fontMachineName) {
    // Abort if this is not Furore font that loaded.
    if (fontMachineName !== 'furore') {
      return;
    }

    addComponent();
  });
}
});
});
