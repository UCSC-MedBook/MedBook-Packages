Package.describe({
  name: 'medbook:primary-schemas',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Primary collection schemas for MedBook',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('aldeed:simple-schema');

  api.addFiles('primary_schemas.js');

  // symbol exports
  api.export('Patients');
  api.export('Samples');
  api.export('Treatments');
  api.export('BloodLabs');
  api.export('Studies');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('medbook:primary-schemas');
  api.addFiles('primary-schemas-tests.js');
});
