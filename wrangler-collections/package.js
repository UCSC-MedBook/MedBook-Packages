Package.describe({
  name: 'medbook:wrangler-collections',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Collections and such relating to Wrangler',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
});

Npm.depends({"binary-search": "1.2.0"});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use('aldeed:simple-schema@1.3.3');
  api.use('aldeed:autoform@5.5.1');

  api.use('medbook:primary-collections@0.0.3');
  api.use('underscore');

  api.addFiles('Wrangler.js');

  api.addFiles('WranglerFileTypes.js');
  api.addFiles('wrangler-collections.js');
  api.addFiles('createIndexes.js', 'server');

  api.export('Wrangler');
  api.export("WranglerFileTypes", "server");
  api.export("WranglerFileTypeSchemas", "client");

  api.export('WranglerSubmissions');
  api.export('WranglerDocuments');
  api.export('WranglerFiles');

  // TODO: remove this when we move the schemas to collections
  api.export('getCollectionByName');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('medbook:wrangler-collections');
  api.addFiles('wrangler-collections-tests.js');
});
