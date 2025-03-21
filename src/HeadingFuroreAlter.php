<?php

declare(strict_types=1);

namespace Drupal\ambientimpact_site;

use Drupal\Component\Transliteration\TransliterationInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use function str_replace;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Heading alter class for the Furore font.
 */
class HeadingFuroreAlter implements ContainerInjectionInterface {

  /**
   * Constructor; saves dependencies.
   *
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   The language manager.
   *
   * @param \Drupal\Component\Transliteration\TransliterationInterface $transliteration
   *   The transliteration service.
   */
  public function __construct(
    protected readonly LanguageManagerInterface $languageManager,
    protected readonly TransliterationInterface $transliteration,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('language_manager'),
      $container->get('transliteration'),
    );
  }

  /**
   * Transliterate from Unicode to US-ASCII for the Furore font.
   *
   * This transliterates titles from Unicode to US-ASCII (primarily intended
   * for nodes, but others work too) to avoid characters with accents as the
   * Furore font does not support those and the browser would fall back to
   * another font which would look out of place.
   *
   * @param string $string
   *   The string to transliterate
   *
   * @param string|null $langCode
   *   The language code, or null to use the current language the language
   *   manager returns.
   *
   * @return string
   *   The $string parameter converted from Unicode to US-ASCII.
   *
   * @see \Drupal\Component\Transliteration\TransliterationInterface::transliterate()
   */
  public function transliterate(
    string $string, ?string $langCode = null,
  ): string {

    $langCode = $langCode ?? $this->languageManager->getCurrentLanguage()
      ->getId();

    return $this->transliteration->transliterate($string, $langCode);

  }

}
