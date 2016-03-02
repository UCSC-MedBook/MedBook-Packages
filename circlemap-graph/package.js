Package.describe({
    name : 'medbook:circlemap-graph',
    version : '0.3.0',
    // 0.3.0 - include collection, publish, and template files
    // 0.2.2 - save zoom and opacity of nodes when sorting rings
    // 0.2.1 - retain query string when linking out from protein node
    // 0.2.0 - Add drugbank and pubmed linkouts
    // Brief, one-line summary of the package.
    summary : 'Draw a network graph with circlemaps as nodes.',
    // URL to the Git repository containing the source code for this package.
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    // to publish:
    // delete .version and versions.json files
    // "meteor publish --release 1.1.0.2"

    api.use(["templating", "medbook:primary-collections@0.0.15", "d3js:d3@3.5.8", "alisalaah:jquery-contextmenu@1.6.6"], "client");

    api.addFiles(["collection.js"], ["server", "client"]);
    api.addFiles(["publish.js"], ["server"]);
    api.addFiles(["circlemap-graph.js", "template.html", "template.js"], ["client"]);

    // expose circleMapGraph object
    // api.export(['circleMapGraph'], 'client');

    // expose template
    api.export(["circleMapTemplate"], ["client"]);

    // expose collections
    api.export(["CohortSignatures"], ["client", "server"]);

});

Package.onTest(function(api) {
    api.use('tinytest');
    api.addFiles('circlemap-graph-tests.js');
});
