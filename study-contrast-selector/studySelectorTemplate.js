/**
 * event handlers
 */
Template.studySelectorTemplate.events({
    'change #studySelector' : function(event, template) {
        this.currStudy = event.currentTarget.value;
        var currentRoute = Router.current().route.getName();
        console.log('#change study and set session studyID ', currentRoute, this.currStudy);
        Session.set('studyID', this.currStudy);
        Router.go(currentRoute, {}, {
            query : {
                'study' : this.currStudy
            }
        });
    },
});

/**
 * helpers
 */
Template.studySelectorTemplate.helpers({
    studies : function() {
        var selectorObj = {};
        var optionsObj = {
            "sort" : {
                "short_name" : 1
            }
        };
        var cursor = Studies.find(selectorObj, optionsObj);

        return cursor;
    },
    selected : function() {
        if (Session.get('studyID') == this.id)
            return true;
        else
            return false;
    },
    currentQueryString : function() {
        var study = Session.get('studyID');
        var contrast = Session.get('selectedContrast');
        if (study) {
            if (contrast) {
                return {
                    study : study,
                    contrast : contrast
                };
            }
            return {
                study : study
            };
        }
        return;
    }
});

/**
 * lifecycle hooks
 */
Template.studySelectorTemplate.created = function() {
};

Template.studySelectorTemplate.rendered = function() {
};

Template.studySelectorTemplate.destroyed = function() {
};
