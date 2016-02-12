/*****************************************************************************/
/* GeneAnnotation Publish Functions
 /*****************************************************************************/

Meteor.publish('geneAnnotation', function(geneList, study_label) {
    var s = "<--- publish geneAnnotation in publish_gene_annotation.js";

    geneList = (geneList) ? geneList : [];
    study_label = (study_label) ? study_label : "";

    var cursor = GeneAnnotation.find({
        "gene_label" : {
            "$in" : geneList
        },
        "study_label" : study_label
    });

    console.log('geneAnnotation count:', cursor.count(), "study_label:", study_label, s, 'geneList', geneList);

    return cursor;
});