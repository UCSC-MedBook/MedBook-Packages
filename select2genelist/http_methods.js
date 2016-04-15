// Genes defined in primary collections

HTTP.methods({
    genes : function() {
        console.log("IN HTTP Method genes", "query:", this.query.q);

        var regexString = "^" + this.query.q + ".*";
        var items = [];
        var seen = {};

        Genes.find({
            gene_label : {
                $regex : regexString
            }
        }, {
            sort : {
                gene_label : 1
            },
            fields : {
                "gene_label" : 1
            }
        }).forEach(function(f) {
            if (!(f.gene_label in seen)) {
                items.push({
                    id : f.gene_label,
                    text : f.gene_label
                });
                seen[f.gene_label] = 1;
            }
        });
        items = _.unique(items);
        this.setContentType("application/javascript");
        return JSON.stringify({
            items : items
        });
    },

    quick : function(data) {
        console.log("IN HTTP Method quick");

        var items = [];
        var term = this.query.q;
        var collection = this.query.c;
        var fieldName = this.query.f;
        var fields = {};
        fields[fieldName] = 1;

        GeneSets.find({
            name : {
                $regex : "^" + term + ".*"
            }
        }, {
            sort : fields,
            fields : fields
        }).forEach(function(f) {
            items.push({
                id : f._id,
                text : f[fieldName]
            });
        });
        this.setContentType("application/javascript");

        return JSON.stringify({
            items : items
        });
    },
});
