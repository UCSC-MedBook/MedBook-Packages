Package.describe({
  name: "medbook:sample-pie-charts",
  summary: "Draw sample pie chart clinical data summaries.",
  version: "0.0.2",
  // 0.0.2 - pie_charts object moved to its own package
  git: "https://github.com/UCSC-MedBook/MedBook-Packages.git"
});

Package.onUse(function(api) {
//  api.versionsFrom('METEOR@0.9.3.1');
  api.versionsFrom('1.1.0.2');
  // to publish:
  // delete .version and versions.json files
  // "meteor publish --release 1.1.0.2"
  api.export('pie_charts', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
});
