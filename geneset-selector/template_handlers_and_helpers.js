Meteor.startup(function() {
    if (Meteor.isClient) {
        console.log("subscribe to geneSets");
        Meteor.subscribe('geneSets');
    }
});

Template.genesetSelector.events({
    'change #geneset' : function(event, template) {
        // The cookie stores genes required by obs-deck in case they might be missing from the geneset.
        // For example, if user has done sample sorting based on a gene expression, that gene expression data must be present.

        // TODO first, throw away pivot settings
        // delete Session.keys['pivotSettings'];

        var cookieGenes = [];

        try {
            // error if observation_deck object DNE
            cookieGenes = observation_deck.getCookieEvents();
        } catch (err) {
            console.log("ERROR", err.name, err.message);
        } finally {
        }
        console.log('cookieGenes', cookieGenes);

        var sourceElem = event.target || event.srcElement;
        var elemValue = sourceElem.value;

        var genesetName = '';
        for (var i = 0; i < sourceElem.length; i++) {
            var option = sourceElem[i];
            if (option.selected) {
                // option element text also contains set size
                genesetName = (option.text);
                var fields = genesetName.split(" (");
                fields.pop();
                genesetName = fields.join();
                break;
            }
        }

        Session.set('geneset', genesetName);
        console.log('SESSION genesetName:', Session.get('geneset'));

        Session.set('geneList', cookieGenes.concat(elemValue.split(',')));
        console.log('SESSION geneset members', Session.get('geneList').length, 'genes', Session.get('geneList'));
    },
    'click .select_geneset' : function() {
        console.log('event: click .select_geneset');
    },
    // temporary genelist entry control
    "change .genelist" : function(event, template) {
        var genelist = $(template.find("input[class='genelist']"));
        var valObj = genelist.select2("val");
        var valueString = valObj[0]["value"];
        var stringList = valueString.toUpperCase().trim().split(/[,\s]+/);
        stringList = _.uniq(stringList);
        var oldSessionGeneList = Session.get('geneList');
        if (_.isUndefined(oldSessionGeneList)) {
            oldSessionGeneList = [];
        }
        // console.log("oldSessionGeneList", oldSessionGeneList);
        var newSessionGeneList = _.uniq(oldSessionGeneList.concat(stringList));
        // console.log("newSessionGeneList", newSessionGeneList);

        Session.set("geneList", newSessionGeneList);
    }
});

Template.genesetSelector.helpers({
    // requires access to GeneSets collection.
    genesets : function() {
        var genesetsResp = GeneSets.find({}, {
            reactive : true
        });
        var genesetsDocList = genesetsResp.fetch();

        console.log("GENESETS 1", genesetsDocList.length);

        var result = [];
        for (var i = 0; i < genesetsDocList.length; i++) {
            var doc = genesetsDocList[i];
            var name = doc['name'];
            var members = doc['members'];
            result.push({
                'name' : name,
                'members' : members,
                'size' : members.length
            });
        }
        return result;
    },
    selected : function() {
        var geneSetObj = this;
        var sessionGeneSet = Session.get('geneset');
        if (sessionGeneSet === geneSetObj.name) {
            return true;
        } else {
            return false;
        }
    }
});

