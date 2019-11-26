<?php

namespace Drupal\ambientimpact_site;

use Drupal\Component\Utility\NestedArray;
use EasySVG;

/**
 * Generate <svg> elements with provided text converted to a <path> element.
 *
 * @todo Can this be reworked to be reusable with other fonts, font sizes, etc.?
 *
 * @see https://github.com/kartsims/easysvg
 *   Uses this class to convert SVG font to <path>s.
 */
class HeadingTextToSVG {
  /**
   * Generate an <svg> element from provided text.
   *
   * @param string $text
   *   Text to convert to an <svg> element.
   *
   * @param array $attributes
   *   An optional array of attributes to add to the <svg> element.
   *
   * @return string
   *   Markup containing an <svg> element with the provided text converted to a
   *   <path>.
   */
  public static function generate(
    string $text, array $attributes = []
  ) {
    $svg = new EasySVG();

    $theme = \Drupal::theme()->getActiveTheme();

    // Set the font and font size. Note that if you change the font size, you'll
    // have to recalculate a bunch of magic numbers farther down.
    $svg->setFont($theme->getPath() . '/fonts/furore/furore.svg', 100);

    // Generate the <path> definition for the provided text.
    //
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
    //   Describes the format.
    $def = $svg->textDef($text);

    // Translate the generated paths with Furore magic numbers to align it
    // horizontally and vertically with the left and top edges of the viewbox.
    // Note that if you change the font size, you have to recalculate these.
    $def = $svg->defTranslate($def, -5, -50);

    // Add the translated path definition to the EasySVG instance.
    $svg->addPath($def);

    $textDimensions = $svg->textDimensions($text);

    // Get the text width and height, adjusting for Furore's extra space around
    // characters with some magic numbers. Note that if you change the font
    // size, you'll have to recalculate at least the width offset below.
    //
    // @see https://github.com/kartsims/easysvg/issues/23
    //   Open issue for EasySVG that details problems with how it calculates
    //   these values.
    $width  = $textDimensions[0] - 7;
    $height = $textDimensions[1] * 0.5833;

    // Merge any provided attributes on top of defaults we generate based on the
    // width and height of the text.
    $attributes = NestedArray::mergeDeep([
      'width'   => $width,
      'height'  => $height,
      'viewBox' => '0 0 ' . $width . ' ' . $height,
      'x'       => '0',
      'y'       => '0',
      // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
      'preserveAspectRatio' => 'xMaxYMax meet',
    ], $attributes);

    // Add attributes.
    foreach ($attributes as $name => $value) {
      $svg->addAttribute($name, $value);
    }

    // Return the rendered <svg> without the XML declaration.
    return str_replace(
      '<?xml version="1.0"?>' . "\n",
      '',
      $svg->asXML()
    );
  }
}
