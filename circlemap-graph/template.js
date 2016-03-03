/**
 * for use with circleMapHallmarksModeTemplate
 */
function drawCircleMapGraph_hallmarksMode(sifString, sampleData, centerScores) {
    console.log("BEGIN drawCircleMapGraph_hallmarksMode");
    console.log("sifString", sifString);
    console.log("sampleData", sampleData);
    console.log("centerScores", centerScores);

    var containerDiv = document.getElementById("render-circle-map-here");
    circleMapGraph.build({
        "sifGraphData" : sifString,
        "hallmarksModeSampleData" : sampleData,
        "centerScores" : centerScores
    });

    console.log("END drawCircleMapGraph_hallmarksMode");
};

/**
 * for use with circleMapTemplate
 */
function drawCircleMapGraph(geneReport, patientSamples, expressionData, viperSignaturesData, targettingDrugsData) {
    console.log("geneReport: ", geneReport);
    console.log("expressionData: ", expressionData);
    console.log("viperSignaturesData", viperSignaturesData);
    console.log("patientSamples", patientSamples);
    console.log("targettingDrugsData", targettingDrugsData);

    if (geneReport.network.elements.length > 0) {
        var containerDiv = document.getElementById("render-circle-map-here");
        circleMapGraph.build({
            "targettingDrugsData" : targettingDrugsData,
            "patientSamples" : patientSamples,
            "medbookGraphData" : geneReport,
            "medbookExprData" : expressionData,
            "medbookViperSignaturesData" : viperSignaturesData,
            "containerDiv" : containerDiv,
            "circleDataLoaded" : true
        });
    }
}

function getQueryStringParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/**
 *
 * @param {Object} patient_label
 */
function getPatientSamples(patient_label) {
    var patientData = PatientReports.findOne({
        "patient_label" : patient_label
    }, {
        "metadata" : 1
    });

    if (_.isUndefined(patientData)) {
        return [];
    }

    var sample_labels = patientData["metadata"]["sample_labels"];
    var returnObj = [{
        "patient_label" : patient_label,
        "sample_labels" : sample_labels
    }];

    return returnObj;
};

Template.circleMapTemplate.rendered = function() {
    Deps.autorun(function(first) {
        if (Session.get("geneReportLoaded") === true) {
            var geneReport = GeneReports.find().fetch()[0];
            var expressionData = Expression2.find().fetch();
            var viperSignaturesData = CohortSignatures.find().fetch();
            var targettingDrugsData = ClinicalEvidenceSummaries.find().fetch();

            // add in sample_values
            _.each(viperSignaturesData, function(value) {
                if (!value.sample_values) {
                    value.sample_values = value.samples;
                }
            });

            var patient_label = getQueryStringParameterByName("patient_label");
            var patientSamples = getPatientSamples(patient_label);

            drawCircleMapGraph(geneReport, patientSamples, expressionData, viperSignaturesData, targettingDrugsData);
            first.stop();
        }
    });
};

Template.circleMapHallmarksModeTemplate.rendered = function() {
    const instance = this;

    instance.autorun(function(first) {
        // get graph data (sif in a string)
        var sifString = Session.get("sifString");

        // get sample data (TSV in a string, with columns: Gene, Kinases, Mutations, Amps, Dels, TFs)
        var sampleData = Session.get("hallmarksSampleData");

        // get node center scores
        var parsedSampleData = d3.tsv.parse(sampleData);
        var centerScores = {};
        _.each(parsedSampleData, function(obj) {
            centerScores[obj["Gene"]] = obj["Kinases"];
        });

        drawCircleMapGraph_hallmarksMode(sifString, sampleData, centerScores);
        first.stop();
    });
};
