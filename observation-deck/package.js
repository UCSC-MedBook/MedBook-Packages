Package.describe({
    name : 'medbook:observation-deck',
    summary : 'Observation Deck visualizes multiple data types for a group of samples.',
    version : '0.2.7',
    // v0.2.7: samples with "no call" for mutation call visualized with white square
    // v0.2.6: use expression3 collection instead of expression2
    // v0.2.5: update to medbook:primary-collections@0.0.17
    // v0.2.4: ignore silent mutations (sequence_ontology = SY)
    // v0.2.3: visualize mutation calls with oncoprint-style graphics depending upos sequence ontology
    // v0.2.2: add gistic copy number and chasm mutation impact
    // v0.2.1: add geneAnntotation data (gistic copy number)
    // v0.2.0: include collection, publish, and template files
    // v0.1.4: accept contrast data to create a clinical event row
    // v0.1.3: fixed: Some medbook session vars were not cleared when resetting.
    // v0.1.2: stop packing most dependencies into plugin. Do api.use() instead.
    // v0.1.1: dev_mode context menu checkbox to lock an event row
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git'
});

Package.onUse(function(api) {
    api.versionsFrom('1.1.0.2');
    // to publish:
    // delete .version and versions.json files
    // "meteor publish --release 1.1.0.2"

    api.use(["templating", "medbook:primary-collections@0.0.17", "d3js:d3@3.5.8", "alisalaah:jquery-contextmenu@1.6.6", "sergeyt:typeahead@0.0.11"], "client");

    api.addFiles(["collection.js"], ["server", "client"]);
    api.addFiles(["publish_correlator.js", "publish_expression.js", "publish_clinical_events_index.js"], ["server"]);
    api.addFiles(["controller.js", 'observation-deck.js', "template.html", "template.js"], ["client"]);

    // expose observation-deck object
    api.export(["observation_deck"], ["client"]);

    // expose template
    api.export(["obsDeckTemplate"], ["client"]);

    // expose collections
    // api.export(["ClinicalEvents", "SignatureScores", "Correlator", "Signature"], ["client", "server"]);
    api.export(["Contrast", "ClinicalEvents", "Correlator", "Signature"], ["client", "server"]);

    // expose RouteController settings object
    api.export(["obsDeckRouteControllerSettings"], ["client"]);
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.addFiles('observation-deck-tests.js');
});
