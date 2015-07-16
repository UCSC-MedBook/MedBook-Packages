Meteor.methods({
  setUserContext: function (context) {
    console.log(context);

    if (!this.userId) {
      throw new Meteor.Error(401, 'You must be logged in.');
    }

    Meteor.users.update({
        "_id": Meteor.user()._id
      }, {
        $set: {
          "profile.context.patients": context.patients,
          "profile.context.genes": context.genes,
          "profile.context.signatures": context.signatures,
        }
      });
  }
});
