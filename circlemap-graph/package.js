Package.describe({
    name : 'circlemap-graph',
    version : '0.0.1',
    // Brief, one-line summary of the package.
    summary : '',
    // URL to the Git repository containing the source code for this package.
    git : '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');

    // api.use(['jquery']);
    // api.use('jquery');
    api.use("alisalaah:jquery-contextmenu");

    api.export('circleMapGraph', 'client');
    api.export('u', 'client');
    api.addFiles('circlemap-graph.js');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('circlemap-graph');
    api.addFiles('circlemap-graph-tests.js');
});
