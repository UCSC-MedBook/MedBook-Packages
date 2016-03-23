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
        var geneAnnotationDocList = GeneAnnotation.find().fetch();

        var studiesDocList = Studies.find({
            "id" : Session.get("studyID"),
            "gene_expression_index" : {
                "$exists" : true
            }
        }).fetch();
        // console.log("studiesDocList", studiesDocList);

        if (studiesDocList.length > 0) {
            var exp3DocList = Expression3.find().fetch();
            // console.log("exp3DocList", exp3DocList);

            // map sampleID to 0-based array position
            var gene_expression_index = studiesDocList[0]["gene_expression_index"];
            // console.log("gene_expression_index", gene_expression_index);

            // convert Exp3DocList to ExpDocList
            var newDocList = [];
            _.each(exp3DocList, function(doc) {
                var newDoc = {};
                newDocList.push(newDoc);
                var gene = doc["gene_label"];
                newDoc["gene"] = gene;
                newDoc["samples"] = {};

                // data is array of scores
                var data = doc["rsem_quan_log2"];

                _.each(gene_expression_index, function(sampleIndex, sampleID) {
                    var score = data[sampleIndex];
                    // create object for sampleID
                    if (_.isUndefined(newDoc["samples"][sampleID])) {
                        newDoc["samples"][sampleID] = {};
                    }
                    newDoc["samples"][sampleID]["rsem_quan_log2"] = score;
                });
            });

            // console.log("newDocList", newDocList);
            expDocList = newDocList;
        } else {
            console.log("NO gene_expression_index FOUND FOR THIS STUDY");
        }

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

        var testedSamples = {
            "mutation call" : ["DTB-005", "DTB-009", "DTB-010Pro2", "DTB-011", "DTB-018", "DTB-019", "DTB-020", "DTB-022Pro2", "DTB-023", "DTB-024", "DTB-030", "DTB-034", "DTB-036", "DTB-038", "DTB-039", "DTB-040", "DTB-042", "DTB-046", "DTB-055Pro", "DTB-059", "DTB-060", "DTB-061", "DTB-063", "DTB-063Pro", "DTB-064", "DTB-067Pro", "DTB-069", "DTB-071", "DTB-073", "DTB-073Pro", "DTB-077Pro", "DTB-080", "DTB-080Pro", "DTB-083", "DTB-089", "DTB-089Pro", "DTB-090", "DTB-090Pro", "DTB-091", "DTB-092", "DTB-094", "DTB-095", "DTB-097", "DTB-097Pro", "DTB-098", "DTB-100", "DTB-102", "DTB-111", "DTB-111Pro", "DTB-118", "DTB-121", "DTB-124", "DTB-127", "DTB-128", "DTB-129", "DTB-132", "DTB-135", "DTB-135Pro", "DTB-138", "DTB-140", "DTB-156"]
        };

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
                    'mutation' : mutDocList,
                    "geneAnnotation" : geneAnnotationDocList,
                    "testedSamples" : testedSamples
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
                    datatype = datatype.toLowerCase();
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
                    } else if (datatype === 'mutation impact score') {
                        // mRNA url: /wb/gene/<gene name>
                        var gene = eventId.replace('_mutation_impact_score', '');
                        var url = '/wb/gene/' + gene;
                        window.open(url, "_self");
                    } else if (datatype === 'gistic_copy_number') {
                        // mRNA url: /wb/gene/<gene name>
                        var gene = eventId.replace('_gistic_copy_number', '');
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
