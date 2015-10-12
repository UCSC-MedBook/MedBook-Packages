Package.describe({
  name: 'medbook:primary-collections',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Primary collections and schemas for MedBook',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('aldeed:autoform@5.5.0');
  api.use('aldeed:simple-schema@1.3.3');
  api.use('aldeed:collection2@2.3.3');
  api.use('underscore');

  api.addFiles('primary_collections.js');

  // symbol exports
  api.export('Studies');
  api.export('Collaborations');

  api.export('Patients');
  api.export('Signatures');
  api.export('CohortSignatures');
  api.export('Mutations');
  api.export('Superpathways');
  api.export('SuperpathwayElements');
  api.export('SuperpathwayInteractions');
  api.export('Mutations');
  api.export('GeneExpression');
  api.export("expression2");
  api.export("genes");
  api.export('Jobs', 'server');
});

Package.onTest(function(api) {
  // I've never used this
  api.use('tinytest');
  api.addFiles('primary_collections_tests.js');
});
