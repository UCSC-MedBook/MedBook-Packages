Package.describe({
	name : 'medbook:circlemap-graph',
    version : '0.2.1',
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

    api.use("alisalaah:jquery-contextmenu@1.6.6");

    api.export('circleMapGraph', 'client');
    api.addFiles('circlemap-graph.js');
});

Package.onTest(function(api) {
    api.use('tinytest');
//    api.use('circlemap-graph');
    api.addFiles('circlemap-graph-tests.js');
});
