Package.describe({
    name : "medbook:sample-pie-charts",
    summary : "Draw sample pie chart clinical data summaries.",
    version : "0.0.3",
    // 0.0.3 - include template and helper
    // 0.0.2 - pie_charts object moved to its own package
    git : "https://github.com/UCSC-MedBook/MedBook-Packages.git"
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    // to publish:
    // delete .version and versions.json files
    // "meteor publish --release 1.1.0.2"

    api.use(["templating", "medbook:primary-collections@0.0.15", "limax:sample-pie-charts@0.0.1"], "client");

    api.addFiles(["sample_pie_charts.html", "sample_pie_charts.js"], ["client"]);

    // expose template
    api.export(["SamplePieChartsTemplate"], ["client"]);
    api.export('pie_charts', 'client');
});

Package.onTest(function(api) {
    api.use('tinytest');
});
