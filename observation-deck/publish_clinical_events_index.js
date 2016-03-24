/*****************************************************************************/
/* ClinicalEventsIndex Publish Functions
 /*****************************************************************************/

Meteor.publish('clinical_events_index', function() {
    var s = "<--- publish clinical_events_index in publish_clinical_events_index.js";

    var findResults = ClinicalEvents.find();
    var count = findResults.count();
    console.log('ClinicalEvents count', count, s);
    return findResults;
});