Package.describe({
  name: 'medbook:report-collections',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Report collections and schemas for MedBook',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('aldeed:simple-schema');
  api.use('aldeed:collection2');

  api.addFiles('report_collections.js');

  api.export('PatientReports');
  api.export('SignatureReports');
  api.export('PathwayReports');
  api.export('GeneReports');
  api.export("expression2");
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('report-collections');
  api.addFiles('report_collections_tests.js');
});
