Package.describe({
  name: 'medbook:charts',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Charts for genomic research',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('iron:router@1.0.9'); // TODO: do we really need this? 

  api.addFiles('helpers.js', 'client');

  api.addFiles([
      // functions to render charts
      'renderWaterfall.js',
      'renderBoxAndWhisker.js',
    ], 'client');

  api.addFiles('render.js', 'client');

  api.export("Charts", "client");
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('medbook:charts');
  api.addFiles('charts-tests.js');
});
