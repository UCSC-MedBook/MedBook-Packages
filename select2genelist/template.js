Template.geneListTemplate.rendered = function() {

    var options = {
        placeholder : "list of genes",
        url : Meteor.absoluteUrl() + "genes",
        // http://localhost:3000/genes?q=MDM
        // response looks like this: {"items":[{"id":"MDM1","text":"MDM1"},{"id":"MDM2","text":"MDM2"},{"id":"MDM4","text":"MDM4"}]}
        // url : "https://api.github.com/search/repositories",
        minimumInputLength : 2,
        multiple : true,
        changeEventCallback : function(value) {
            var sessionVar = "cohort_tab_genelist_widget";
            var sessionGeneList = Session.get(sessionVar);
            sessionGeneList = (_.isUndefined(sessionGeneList)) ? [] : sessionGeneList;

            var changes = {
                added : [],
                deleted : []
            };

            changes.added = _.difference(value, sessionGeneList);
            changes.deleted = _.difference(sessionGeneList, value);

            Session.set(sessionVar, value);
        }
    };

    // geneListWidget is exposed in select2genelist.js
    geneListWidget.setupWidget("#selectTagForSelect2", options);
};