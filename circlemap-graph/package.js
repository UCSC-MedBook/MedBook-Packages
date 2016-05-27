Package.describe({
    name : 'medbook:circlemap-graph',
    version : '0.3.2',
    // 0.3.2 - move circleMapGraph obj to its own package
    // 0.3.1 - add circleMapHallmarksModeTemplate
    // 0.3.0 - include collection, publish, and template files
    // 0.2.2 - save zoom and opacity of nodes when sorting rings
    // 0.2.1 - retain query string when linking out from protein node
    // 0.2.0 - Add drugbank and pubmed linkouts
    summary : 'Draw a network graph with circlemaps as nodes.',
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    // to publish:
    // delete .version and versions.json files
    // "meteor publish --release 1.1.0.2"

    // TODO other medbook packages have upgraded to medbook:primary-collections@0.0.17
    api.use(["templating", "medbook:primary-collections@0.0.15", "limax:circlemap-graph@0.0.4"], "client");

    api.addFiles(["collection.js"], ["server", "client"]);
    api.addFiles(["publish.js"], ["server"]);
    api.addFiles(["template.html", "template.js"], ["client"]);

    // expose circleMapGraph object
    // api.export(['circleMapGraph'], 'client');

    // expose template
    api.export(["circleMapTemplate", "circleMapHallmarksModeTemplate"], ["client"]);

    // expose collections
    api.export(["CohortSignatures"], ["client", "server"]);

});

Package.onTest(function(api) {
    api.use('tinytest');
    api.addFiles('circlemap-graph-tests.js');
});
