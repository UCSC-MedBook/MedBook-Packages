Package.describe({
    name : 'medbook:study-contrast-selector',
    version : '0.0.1',
    // v0.0.1 - (move UI elements out of workbench app)
    summary : 'Controls for selecting study and contrast.',
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git',
    documentation : 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    // to publish:
    // delete .version and versions.json files
    // "meteor publish --release 1.1.0.2"
    api.use(["templating"]);

    api.addFiles(["studySelectorTemplate.html", "studySelectorTemplate.js", "contrastSelectorTemplate.html", "contrastSelectorTemplate.js"], ["client"]);

    // expose template
    api.export(["studySelectorTemplate", "contrastSelectorTemplate"], ["client"]);
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.addFiles('study-contrast-selector-tests.js');
});
