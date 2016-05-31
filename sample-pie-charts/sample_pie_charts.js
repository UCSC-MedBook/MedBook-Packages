Template.SamplePieChartsTemplate.events({
});

Template.SamplePieChartsTemplate.helpers({
    clinical_events : function() {
        console.log('Template.SamplePieChartsTemplate.helper.clinical_events');
        var study = Session.get('studyID');
        var response = ClinicalEvents.find({
            'study' : study
        });

        var docList = response.fetch();
        console.log('docList:', docList.length, '<-- from Template.SamplePieChartsTemplate.helper.clinical_events');

        return response;
    }
});

Template.SamplePieChartsTemplate.created = function() {
};

Template.SamplePieChartsTemplate.rendered = function() {
    // TODO DOM rendered or changed
    // console.log('Template.ClinicalEventsIndex.rendered');

    var divElem = document.getElementById("SamplePieChartsDiv");

    // TODO Deps.autorun is triggered when reactive data source has changed
    this.autorun(function() {
        // console.log('Deps.autorun');
        var s = ' <-- Deps.autorun in sample_pie_charts.js';
        var study = Session.get('studyID');
        var response = ClinicalEvents.find({
            'study' : study
        });

        //var response = ClinicalEvents.find({});
        var docList = response.fetch();
        console.log('for study', study, 'clinical events length:', docList.length, s);
        //console.log('docList:', JSON.stringify(docList), ' <-- Deps.autorun');

        if (docList.length > 0) {
            pie_charts(divElem, {
                'mongoData' : {
                    'clinical' : docList
                }
            });
        } else {
            // remove child elements of divElem
            while (divElem.firstChild) {
                divElem.removeChild(divElem.firstChild);
            }
            divElem.innerHTML = 'no clinical data - select a different study';
        }

    });

};

Template.SamplePieChartsTemplate.destroyed = function() {
};
