Package.describe({
    name : 'medbook:geneset-selector',
    version : '0.0.2',
    // v0.0.2 - correctly detect if obs-deck object is available
    // v0.0.1 - Pulled out server and client components of the geneset selector from medbook:api to this package.
    // published with "meteor publish --release 1.1.0.2"
    summary : 'Template to select a geneset. Also provides access to GeneSets collection.',
    git : '',
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    api.use(["templating"]);

    api.addFiles(["collection.js"], ["server", "client"]);
    api.addFiles(["publish.js"], ["server"]);
    api.addFiles(["template.html", "template_handlers_and_helpers.js"], ["client"]);

    // expose template
    api.export(["genesetSelector"], ["client"]);

    // expose collection
    api.export(["GeneSets"], ["client", "server"]);
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.addFiles('geneset-selector-tests.js');
});
