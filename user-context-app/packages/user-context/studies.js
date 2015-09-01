Meteor.startup(function() {
    if (Meteor.isServer) {
	Meteor.publish("studies", function() {
	    var collaborations = ["public"];

	    if (this.userId != null)  {
		var user = Meteor.users.findOne({_id: this.userId});
		if (user && user.profile &&  user.profile.collaborations != null) {
		    // console.log("user.profile.collaborations", user.profile.collaborations);
		    collaborations = _.union(collaborations, user.profile.collaborations);
		}
	    }
	    var cursor = Collections.studies.find({
	        $or: 
		     [
		        { public: true },
			{ collaborations: {$in: collaborations}}
	  	     ]
	    });
	    console.log("publish studies", cursor.count());
	    return cursor;
	});
    } else if (Meteor.isClient) {
	Meteor.subscribe("studies");
    }
});
