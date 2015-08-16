Package.describe({
  name: 'medbook:user-context',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Provides a UI for MedBook user context (selected patients, genes, etc.)',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('templating', 'client');
  api.addFiles(["studies.js"], ['client', 'server']);
  api.addFiles([
      'studies.js',
      'userContext.html',
      'userContext.css',
      'userContext.js'
    ], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('medbook:user-context');
  api.addFiles('user-context-tests.js');
});
