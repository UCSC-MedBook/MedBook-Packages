Package.describe({
    name: 'medbook:select2genelist',
    version : '0.1.0',
    // v0.1.0 - Include the template into the package.
	summary : 'A select2 widget that gives gene symbol suggestions via an included http method.',
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');
    api.use(["templating@1.1.1", 'cfs:http-methods@0.0.27', 'natestrauser:select2@4.0.0_1']);

    api.addFiles('http_methods.js', 'server');
    api.addFiles(['select2genelist.js', 'template.html', 'template.js'], 'client');

    // expose template
    api.export(["geneListTemplate"], ["client"]);
});

Package.onTest(function(api) {
    api.use('ecmascript');
    api.use('tinytest');
    // api.use('select2genelist');
    api.addFiles('select2genelist-tests.js');
});
