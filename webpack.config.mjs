import Encore from '@symfony/webpack-encore';
import { glob } from 'glob';
import * as path from 'node:path';

// The remaining modules are CommonJS only. Because of this, they must be
// import()ed and destructured like so to behave similarly to ESM imports.
const { default: autoprefixer } = await import('autoprefixer');
const { default: baseThemeImporter } = await import(
  'drupal-ambientimpact-base/baseThemeImporter',
);
const { default: componentPaths } = await import(
  'drupal-ambientimpact-core/componentPaths',
);
const { default: easingGradients } = await import(
  '@neurocracy/postcss-easing-gradients',
);
const { default: FaviconsWebpackPlugin } = await import(
  'favicons-webpack-plugin',
);
const { default: RemoveEmptyScriptsPlugin } = await import(
  'webpack-remove-empty-scripts',
);

const distPath = '.webpack-dist';

/**
 * Whether to output to the paths where the source files are found.
 *
 * If this is true, compiled Sass files, source maps, etc. will be placed
 * alongside their source files. If this is false, built files will be placed in
 * the dist directory defined by distPath.
 *
 * @type {Boolean}
 */
const outputToSourcePaths = true;

/**
 * Get globbed entry points.
 *
 * This uses the 'glob' package to automagically build the array of entry
 * points, as there are a lot of them spread out over many components.
 *
 * @return {Object.<string, string>}
 *
 * @see https://www.npmjs.com/package/glob
 */
function getGlobbedEntries() {

  /**
   * Entries to be returned.
   *
   * @type {Object.<string, string>}
   *
   * @see Encore#addEntries()
   *   Explains expected format.
   */
  let entries = {};

  const results = glob.sync(
    `./!(${distPath})/**/!(_)*.scss`,
  );

  for (const result of results) {

    const parsed = path.parse(result);

    // Note the leading './'
    entries[`./${parsed.dir}/${parsed.name}`] = `./${result}`;

  }

  return entries;

};

// @see https://symfony.com/doc/current/frontend/encore/installation.html#creating-the-webpack-config-js-file
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath(path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  (outputToSourcePaths ? '.' : distPath)
))

// Encore will complain if the public path doesn't start with a slash.
// Unfortunately, it doesn't seem Webpack's automatic public path works here.
//
// @see https://webpack.js.org/guides/public-path/#automatic-publicpath
.setPublicPath('/')
.setManifestKeyPrefix('')

// We output multiple files.
.disableSingleRuntimeChunk()

.configureFilenames({

  // Since Webpack started out primarily for building JavaScript applications,
  // it always outputs a JS files, even if empty. We place these in a temporary
  // directory by default. Note that the 'webpack-remove-empty-scripts' plug-in
  // should prevent these being output, but if there's an error while running
  // Webpack, you'll get a nice 'temp' directory you can just delete.
  js: 'temp/[name].js',

  // Assets are left at their original locations and not hashed. The [query]
  // must be left in to ensure any query string specified in the CSS is
  // preserved.
  //
  // @see https://stackoverflow.com/questions/68737296/disable-asset-bundling-in-webpack-5#68768905
  //
  // @see https://github.com/webpack-contrib/css-loader/issues/889#issuecomment-1298907914
  assets: '[file][query]',

})
.addEntries(getGlobbedEntries())

// Clean out any previously built files in case of source files being removed or
// renamed.
//
// @see https://github.com/johnagan/clean-webpack-plugin
.cleanupOutputBeforeBuild(['**/*.css', '**/*.css.map'])

.enableSourceMaps(!Encore.isProduction())

// We don't use Babel so we can probably just remove all presets to speed it up.
//
// @see https://github.com/symfony/webpack-encore/issues/154#issuecomment-361277968
.configureBabel(function(config) {
  config.presets = [];
})

// Remove any empty scripts Webpack would generate as we aren't a primarily
// JavaScript-based app and only output CSS and assets.
.addPlugin(new RemoveEmptyScriptsPlugin())

// @see https://www.npmjs.com/package/favicons-webpack-plugin
//
// @todo Switch to using the generated manifest.webmanifest and
//   browserconfig.xml? The paths don't seem easily customizable.
.addPlugin(new FaviconsWebpackPlugin({

  // @todo Create a maskable logo variant for the logoMaskable config option.
  //
  // @see https://maskable.app/
  logo:       './images/icons/icon.png',
  outputPath: './images/icons/generated',

  favicons: {

    appName:      'Ambient.Impact',
    appShortName: 'Ambient.Impact',

    start_url: '/',

    background: '#ffffff',
    theme_color: '#c07300',

    display:  'browser',
    lang:     'en-CA',

    // @todo This doesn't seem to add a version query string?
    version:  '1',

    icons: {

      // We provide our own rather than have them generated.
      windows: false,

      yandex: false,

    },

  },

}))

.enableSassLoader(function(options) {
  options.sassOptions = {
    importer: [baseThemeImporter],
    includePaths: componentPaths().all,
  };
})
.enablePostCssLoader(function(options) {
  options.postcssOptions = {
    plugins: [
      // Increase the default number of stops and alpha decimal places to reduce
      // some of the banding.
      easingGradients({stops: 25, alphaDecimals: 10}),
      autoprefixer(),
    ],
  };
})
// Re-enable automatic public path for paths referenced in CSS.
//
// @see https://github.com/symfony/webpack-encore/issues/915#issuecomment-1189319882
.configureMiniCssExtractPlugin(function(config) {
  config.publicPath = 'auto';
})

// Disable the Encore image rule because we provide our own loader config.
.configureImageRule({enabled: false})

// Disable the Encore font rule for now as we only provide one font that hasn't
// changed since 2009.
//
// @todo Remove this and pull font in via Yarn; version via Webpack.
.configureFontRule({enabled: false})

// This disables asset bundling/copying for certain asset types.
//
// @see https://stackoverflow.com/questions/68737296/disable-asset-bundling-in-webpack-5#68768905
.addLoader({
  test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
  type: 'asset/resource',
  generator: {
    emit: false,
  },
})

export default Encore.getWebpackConfig();
