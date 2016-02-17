obsDeckRouteControllerSettings = {
    waitOn : function() {
        var s = '<--- obsDeckRouteControllerSettings.waitOn in controller.js';
        var studyID = Session.get("studyID");
        var selectedContrast = Session.get("selectedContrast");
        var pivotSettings = Session.get("pivotSettings");
        var pagingConfig = Session.get("subscriptionPaging") || {};

        var lockedEvents = Session.get("lockedEvents") || {};

        var sessionGeneLists = {
            "geneList" : _.compact(Session.get("geneList")) || [],
            "cohort_tab_genelist_widget" : Session.get("cohort_tab_genelist_widget") || [],
            "focusGenes" : Session.get("focusGenes") || []
        };

        console.log("sessionGeneLists", sessionGeneLists);

        var pName = null;
        var pDatatype = null;
        var pVersion = null;

        console.log("pivotSettings", pivotSettings, s);

        if (pivotSettings != null) {
            pName = pivotSettings['name'];
            pDatatype = pivotSettings['datatype'];
            pVersion = pivotSettings['version'];
        }

        Meteor.subscribe("correlatorResults", pName, pDatatype, pVersion, studyID, selectedContrast, pagingConfig, sessionGeneLists, lockedEvents);
    },

    data : function() {
    },

    action : function() {
        this.render();
    }
};

// In the app, use the RouteController settings like this:
// CohortController = RouteController.extend(obsDeckRouteControllerSettings);