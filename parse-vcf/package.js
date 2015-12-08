Package.describe({
  name: 'medbook:parse-vcf',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Parses .vcf mutation files',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/UCSC-MedBook/MedBook-Packages',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.use('erasaur:meteor-lodash@3.10.1_1');
  api.addFiles('vcf-js/vcf.js');

  api.export("ParseVCF");
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('medbook:parse-vcf');
  api.addFiles('parse-vcf-tests.js');
});
