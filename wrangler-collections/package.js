Package.describe({
  name: 'medbook:wrangler-collections',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use('aldeed:simple-schema@1.3.3');
  api.use('aldeed:autoform@5.5.0');
  api.use('cfs:gridfs@0.0.33');
  api.use('cfs:standard-packages@0.5.9');
  api.use('medbook:primary-collections');
  api.use('underscore');

  api.addFiles('wrangler-collections.js');
  api.addFiles('createIndexes.js', 'server');

  api.export('WranglerSubmissions');
  api.export('WranglerDocuments');
  api.export('WranglerFiles');
  api.export('SlugsAndNames');
  api.export('Blobs');

  // TODO: remove this when we move the schemas to collections
  api.export('wranglerFileOptions');
  api.export('getCollectionByName');

  api.export('BlobStore', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('medbook:wrangler-collections');
  api.addFiles('wrangler-collections-tests.js');
});
