Package.describe({
	name: 'medbook:select2genelist',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'A select2 widget that gives gene symbol suggestions.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  console.log("Package.onUse for select2genelist");
  api.versionsFrom('1.1.0.2');
//  api.use('ecmascript');
  api.use(['natestrauser:select2']);

  api.addFiles('select2genelist.js', 'client');
  api.export('geneListWidget', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('select2genelist');
  api.addFiles('select2genelist-tests.js');
});
