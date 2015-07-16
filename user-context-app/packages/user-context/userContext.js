Template.contextContent.helpers({
  patients: function () {
    // the same thing three times??
    if (Meteor.user() && Meteor.user().profile) {
      var context = Meteor.user().profile.context;
      if (context && context.patients) {
        return context.patients.join([separator = ',']);
      } else {
        return "";
      }
    }
  },
  genes: function () {
    // the same thing three times??
    if (Meteor.user() && Meteor.user().profile) {
      var context = Meteor.user().profile.context;
      if (context && context.genes) {
        return context.genes.join([separator = ',']);
      } else {
        return "";
      }
    }
  },
  signatures: function () {
    // the same thing three times??
    if (Meteor.user() && Meteor.user().profile) {
      var context = Meteor.user().profile.context;
      if (context && context.signatures) {
        return context.signatures.join([separator = ',']);
      } else {
        return "";
      }
    }
  }
});

Template.contextContent.events({
  "submit .set-context": function (event) {
    // prevent default browser form submit
    event.preventDefault();

    // get values from form
    var patientsString = event.target.patientList.value;
    var genesString = event.target.geneList.value;
    var signaturesString = event.target.signatureList.value;

    // remove these
    console.log("patientsString: " + patientsString);

    function stringToArray(string) {
      if (string.length > 0) {
        array = string.split(",");
        for (var i = 0; i < array.length; i++) {
          // clean out whitespace
          array[i] = array[i].replace(/\s/g, "");
        }
        return array;
      } else {
        return null;
      }
    }

    Meteor.call("setUserContext", {
        "patients": stringToArray(patientsString),
        "genes": stringToArray(genesString),
        "signatures": stringToArray(signaturesString)
      }, function (error) {
        if (error && error.error === "logged-out") {
          console.log("You're not logged in!");
        }
    });
  }
});
