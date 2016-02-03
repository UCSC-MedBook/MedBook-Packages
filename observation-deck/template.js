/**
 * event handlers and helpers
 */

Template.obsDeckTemplate.events({});

Template.obsDeckTemplate.helpers({});

/**
 * lifecycle hooks
 */
Template.obsDeckTemplate.created = function() {
};

Template.obsDeckTemplate.rendered = function() {
    console.log("Template.obsDeckTemplate.rendered");

    var divElem = document.getElementById("obsDeckTemplateDiv");

    // Deps.autorun is triggered when reactive data source has changed
    Deps.autorun(function() {
        var s = ' <-- Deps.autorun in obsDeckTemplate.rendered';

        var corrDocList = Correlator.find().fetch();
        var clinDocList = ClinicalEvents.find().fetch();
        var expDocList = Expression2.find().fetch();
        var mutDocList = Mutations.find().fetch();
        var signatureScoresDoclist = SignatureScores.find().fetch();
        var sigIdsDocList = Signature.find().fetch();

        // okay to access Session variable here w.r.t churning?
        // var sessionGeneList = Session.get("geneList") || [];
        // var cohort_tab_genelist_widget = Session.get("cohort_tab_genelist_widget") || [];
        // sessionGeneList = sessionGeneList.concat(cohort_tab_genelist_widget);

        var sessionGeneLists = {
            "geneList" : _.compact(Session.get("geneList")) || [],
            "cohort_tab_genelist_widget" : Session.get("cohort_tab_genelist_widget") || [],
            "focusGenes" : Session.get("focusGenes") || []
        };

        // get contrast data
        var contrastId = Session.get("selectedContrast");
        var contrastDocs = Contrast.find({
            "_id" : contrastId
        }).fetch();

        // observation_deck is exposed via observation-deck package
        // build observation deck
        if ((clinDocList.length > 0) || (expDocList.length > 0)) {
            od_config = observation_deck.buildObservationDeck(divElem, {
                // gene query service -> http://localhost:3000/genes?q=MAPK
                "geneQueryUrl" : "/genes?q=",
                "sigQueryUrl" : "/signatures?q=",
                // geneList selected from geneSet UI control
                "sessionGeneLists" : sessionGeneLists,
                'pivotScores' : {
                    'object' : corrDocList
                },
                'mongoData' : {
                    'contrast' : contrastDocs[0],
                    'clinical' : clinDocList,
                    'expression' : expDocList,
                    'mutation' : mutDocList
                },
                'signature' : {
                    'expression' : {
                        'object' : [signatureScoresDoclist]
                    }
                },
                'signature_index' : {
                    'expression' : {
                        'object' : sigIdsDocList
                    }
                },
                "rowTitleCallback" : function(eventId, config) {
                    var eventObj = config['eventAlbum'].getEvent(eventId);
                    var datatype = eventObj.metadata['datatype'];
                    console.log(eventId, datatype);
                    if (datatype === 'expression data') {
                        // mRNA url: /wb/gene/<gene name>
                        var gene = eventId.replace('_mRNA', '');
                        var url = '/wb/gene/' + gene;
                        window.open(url, "_self");
                    } else if (datatype === 'mutation call') {
                        // mRNA url: /wb/gene/<gene name>
                        var gene = eventId.replace('_mutation', '');
                        var url = '/wb/gene/' + gene;
                        window.open(url, "_self");
                    } else if (datatype === 'clinical data') {
                        // clinical url: /wb/clinical/<name>
                        var feature = eventId;
                        var url = '/wb/clinical/' + feature;
                        window.open(url, "_self");
                    } else if (datatype === "kinase target activity" || datatype === "tf target activity" || datatype === "expression signature") {
                        // signature url: /wb/signature/<sigName>
                        var sigName = eventId;
                        var url = "/wb/signature/" + sigName;
                        window.open(url, "_self");
                    }
                },
                "columnTitleCallback" : function(sampleId, config) {
                    var url = '/wb/patient/' + sampleId;
                    window.open(url, "_self");
                }
            });
        } else {
            // remove child elements of divElem
            while (divElem.firstChild) {
                divElem.removeChild(divElem.firstChild);
            }
            divElem.innerHTML = 'no data';
        }

    });

};

Template.obsDeckTemplate.destroyed = function() {
};
