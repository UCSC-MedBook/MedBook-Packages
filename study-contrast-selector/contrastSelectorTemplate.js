/**
 * event handlers
 */
Template.contrastSelectorTemplate.events({
    'change #contrastSelectorDiv' : function(event, template) {
        this.currContrast = event.target.value;
        var studyId = Session.get('studyID');
        console.log('get session studyID', studyId);
        console.log('#change contrast', event);
        var currentRoute = Router.current().route.getName();
        console.log('->contrast route', currentRoute, 'cont', this.currContrast, 'this', this);
    },

    'change #contrastSelectTag' : function(event, template) {
        Session.set('selectedContrast', event.currentTarget.value);
        this.currContrast = event.currentTarget.value;
        console.log('Session contrastID:', Session.get('selectedContrast'));
    }
});

/**
 * helpers
 */
Template.contrastSelectorTemplate.helpers({
    contrast : function() {
        var study = Session.get('studyID');
        console.log('find contrasts for studyID:' + study);
        return Contrast.find({
            "studyID" : study
        }, {
            sort : {
                name : 1
            }
        });
    }
});

/**
 * lifecycle hooks
 */
Template.contrastSelectorTemplate.created = function() {
};

Template.contrastSelectorTemplate.rendered = function() {
};

Template.contrastSelectorTemplate.destroyed = function() {
};
