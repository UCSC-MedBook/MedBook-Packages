Package.describe({
	name : 'medbook:observation-deck',
    summary : 'Observation Deck visualizes multiple data types for a group of samples.',
    version : '0.1.4',
	// v0.1.4: accept contrast data to create a clinical event row
	// v0.1.3: fixed: Some medbook session vars were not cleared when resetting.
	// v0.1.2: stop packing most dependencies into plugin. Do api.use() instead.
	// v0.1.1: dev_mode context menu checkbox to lock an event row
    git : 'https://github.com/UCSC-MedBook/MedBook-Packages.git'
});

Package.onUse(function(api) {
    api.versionsFrom('0.9.0');
    api.use(['jquery',"d3js:d3@3.4.13","alisalaah:jquery-contextmenu@1.6.6","sergeyt:typeahead@0.0.11"]);

    api.export('observation_deck', 'client');
    api.export('u', 'client');
    api.addFiles('observation-deck.js', 'client');
});

Package.onTest(function(api) {
    api.use('tinytest');
    // api.use('observation-deck');
    api.addFiles('observation-deck-tests.js');
});
