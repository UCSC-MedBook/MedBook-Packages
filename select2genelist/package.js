Package.describe({
    name: 'medbook:select2genelist',
    version : '0.1.9',
	// v0.1.9 - update package requirements
	// v0.1.8 - publish with "meteor publish --release METEOR@1.1.0.2"
	// v0.1.7 - update package requirements
	// v0.1.6 - publish with "meteor publish --release METEOR@1.1.0.3"
	// v0.1.5 - update package requirements
	// v0.1.4 - update package requirements
	// v0.1.3 - update package requirements
	// v0.1.2 - update package requirements
	// v0.1.1 - update package requirements
    // v0.1.0 - Include the template into the package.
	summary : 'A select2 widget that gives gene symbol suggestions via an included http method.',
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('METEOR@1.1.0.2');
	api.use(["templating@1.0.0", 'cfs:http-methods@0.0.27', 'natestrauser:select2@4.0.0_1']);

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
