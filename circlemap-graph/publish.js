var getTargettingDrugs = function(genes) {
    var ignoreDrugs = ["N/A", ""];
    var cursor = ClinicalEvidenceSummaries.find({
        "gene" : {
            $in : genes
        },
        "evidence_direction" : "Supports",
        "clinical_significance" : "Sensitivity",
        "drugs" : {
            $nin : ignoreDrugs
        }
    }, {
        fields : {
            gene : 1,
            drugs : 1,
            pubmed_id : 1
        }
    });
    return cursor;
};

Meteor.publish("GeneReport", function(geneLabel) {
    var geneReportCursor = GeneReports.find({
        "gene_label" : geneLabel
    }, {
        limit : 1
    });
    var currentReport = geneReportCursor.fetch()[0];

    if (currentReport) {// in case we don't have one
        var geneNames = _.pluck(currentReport.network.elements, 'name');
        geneNames = _.uniq(geneNames);

        // get targetting drugs
        var targettingDrugsCursor = getTargettingDrugs(geneNames);

        console.log("Expression2 undefined?", _.isUndefined(Expression2));
        console.log("CohortSignatures undefined?", _.isUndefined(CohortSignatures));

        var expression2Cursor = Expression2.find({
            "gene" : {
                $in : geneNames
            }
        });
        var cohortSignaturesCursor = CohortSignatures.find({
            "algorithm" : "viper",
            "label" : {
                $in : geneNames
            },
        });

        return [geneReportCursor, expression2Cursor, cohortSignaturesCursor, targettingDrugsCursor];
    } else {
        // must return this for Meteor to say the subscription is ready
        return [];
    }
});