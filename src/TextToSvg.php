<?php

namespace Drupal\ambientimpact_site;

use EasySVG;
use SimpleXMLElement;

/**
 * Generate SVG paths from text.
 *
 * @see https://github.com/kartsims/easysvg
 *   We extend this class, which does most of the work.
 */
class TextToSvg extends EasySVG {

  /**
   * Get the SVG element object.
   *
   * @return \SimpleXMLElement
   */
  public function getSvg(): SimpleXMLElement {
    return $this->svg;
  }

  /**
   * Get the rendered SVG as an XML document.
   *
   * This is an alias for \EasySVG::asXML().
   *
   * @return string
   *
   * @see \EasySVG::asXML()
   */
  public function asXml(): string {
    return parent::asXML();
  }

  /**
   * Get the rendered SVG for embedding in HTML.
   *
   * This removes the the XML declaration as it's not valid HTML.
   *
   * @return string
   */
  public function asHtml(): string {
    return \str_replace(
      '<?xml version="1.0"?>' . "\n",
      '',
      $this->asXml()
    );
  }

}
