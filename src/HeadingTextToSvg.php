<?php

namespace Drupal\ambientimpact_site;

use Drupal\ambientimpact_core\Utility\AttributeHelper;
use Drupal\ambientimpact_site\TextToSvg;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Theme\ThemeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Generate SVG elements with provided text converted to path elements.
 *
 * @todo Can this be reworked to be reusable with other fonts, font sizes, etc.?
 */
class HeadingTextToSvg implements ContainerInjectionInterface {

  /**
   * The Drupal theme manager service.
   *
   * @var \Drupal\Core\Theme\ThemeManagerInterface
   */
  protected $themeManager;

  /**
   * Constructor; saves dependencies.
   *
   * @param \Drupal\Core\Theme\ThemeManagerInterface $themeManager
   *   The Drupal theme manager service.
   */
  public function __construct(
    ThemeManagerInterface $themeManager
  ) {
    $this->themeManager = $themeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('theme.manager'));
  }

  /**
   * Generate an SVG element with provided text converted to path elements.
   *
   * @param string $text
   *   Text to convert to an SVG element.
   *
   * @param array $attributes
   *   An optional array of attributes to add to the SVG element.
   *
   * @return \Drupal\ambientimpact_site\TextToSvg
   *   TextToSvg object containing the provided text as paths.
   */
  public function generate(string $text, array $attributes = []): TextToSvg {

    /** @var \Drupal\ambientimpact_site\TextToSvg */
    $svg = new TextToSvg();

    /** @var \Drupal\Core\Theme\ActiveTheme The active theme object. */
    $theme = $this->themeManager->getActiveTheme();

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

    /** @var array */
    $textDimensions = $svg->textDimensions($text);

    // The text width and height need to be adjusted for Furore's extra space
    // around characters with some magic numbers. Note that if you change the
    // font size, you'll have to recalculate at least the width offset below.
    //
    // @see https://github.com/kartsims/easysvg/issues/23
    //   Open issue for EasySVG that details problems with how it calculates
    //   these values.

    /** @var float The text width, minus a Furore font magic number. */
    $width  = $textDimensions[0] - 7;

    /** @var float The text height, multiplied by a Furore font magic number. */
    $height = $textDimensions[1] * 0.5833;

    /** @var integer The height of the bleed path. */
    $bleedHeight = 10;

    /** @var float The bleed vertical adjust amount, as a multiplier. */
    $bleedVerticalAdjustAmount = 1.06;

    // Merge any provided attributes on top of defaults we generate based on the
    // width and height of the text.
    $attributes = NestedArray::mergeDeep([
      'width'   => $width,
      'height'  => $height * $bleedVerticalAdjustAmount,
      'viewBox' => '0 0 ' . $width . ' ' . (
        $height * $bleedVerticalAdjustAmount
      ),
      'x'       => '0',
      'y'       => '0',
      // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
      'preserveAspectRatio' => 'xMaxYMax meet',
    ], $attributes);

    if (!empty($attributes['style'])) {
      $styleArray = AttributeHelper::parseStyleAttribute($attributes['style']);

    } else {
      $styleArray = [];
    }

    $styleArray['--bleed-vertical-adjust'] = (
      ($bleedVerticalAdjustAmount - 1) * 100
    ) . '%';

    $attributes['style'] = AttributeHelper::serializeStyleArray($styleArray);

    // Add attributes.
    foreach ($attributes as $name => $value) {
      $svg->addAttribute($name, $value);
    }

    // Add the bleed path. This creates a rectangle whose top edge is flush with
    // the bottom of the text.
    $svg->addPath(\implode(' ', [
      'M 0 ' . ($height * 0.97),
      'h ' . $width,
      'v ' . $bleedHeight,
      'h -' . $width,
      'z',
    ]), ['class' => 'bleed']);

    return $svg;

  }

}
