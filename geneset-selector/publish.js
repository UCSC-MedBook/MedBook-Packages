// GeneSets = new Meteor.Collection('gene_sets');

Meteor.publish('geneSets', function () {
    var findResults = GeneSets.find();
    var count = findResults.count();
    console.log('GeneSets count', count, '<-- publish geneSets');
    return findResults;
});