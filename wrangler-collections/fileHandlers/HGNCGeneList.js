// TODO: specify options instead of a blob_id
function HGNCGeneList (blob_id) {
  console.log("blob_id:", blob_id);
  RectangularFile.call(this, {
    blob_id: blob_id
  });
}

HGNCGeneList.prototype =
    Object.create(RectangularFile.prototype);
HGNCGeneList.prototype.constructor = HGNCGeneList;

// '"first", second, "third"' ==> ["first", "second", "third"]
function makeArray(obj, attribute) {
  var matches = [];

  var originalValue = obj[attribute];
  if (originalValue) {
    // first we deal with the matches that are inside quotes
    // (they're either longer strings or have a comma in the middle somewhere)
    var inQuotes = originalValue.match(/"[^"]+"/g);
    if (inQuotes) {
      for (var index in inQuotes) {
        var value = inQuotes[index];

        // don't deal with them later
        originalValue = originalValue.replace(value, "");

        // trim off the quotes on either end
        matches.push(value.slice(1, value.length - 1));
      }
    }

    // get the rest of the matches, trim, and add to matches
    _.each(originalValue.split(","), function (value) {
      var trimmed = value.trim();
      if (trimmed !== "") {
        matches.push(trimmed);
      }
    });

    // switch from string to array in original object
    obj[attribute] = matches;
  }
}

HGNCGeneList.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber % 1000 === 0) {
    console.log("lineNumber:", lineNumber);
  }

  if (lineNumber === 1) { // header line
    // TODO: add non-required-ness
    var headerMappings = {
      gene_label: "Approved Symbol",
      gene_name: "Approved Name",
      previous_names: "Previous Name",
      previous_labels: "Previous Symbols",
      label_synonyms: "Synonyms",
      name_synonymes: "Name Synonyms",
      chromosome: "Chromosome",
      hgnc_id: "HGNC ID",
      status: "Status", // NOTE: this field is removed before inserting
    };

    this.columnMappings = _.mapObject(headerMappings, function (value) {
      var index = brokenTabs.indexOf(value);
      if (index === -1) {
        throw new Error("Header column not found: " + value);
      }
      return index;
    });

    console.log("this.columnMappings:", this.columnMappings);
    this.genesCreated = 0;
  } else { // rest of file
    var geneObject = {};

    _.mapObject(this.columnMappings, function (columnIndex, attribute) {
      var columnValue = brokenTabs[columnIndex];
      if (columnValue !== "") {
        geneObject[attribute] = columnValue;
      }
    });

    // only insert if approved
    if (geneObject.status === "Approved") {
      geneObject.status = undefined;
      makeArray(geneObject, "previous_names");
      makeArray(geneObject, "previous_labels");
      makeArray(geneObject, "label_synonyms");
      makeArray(geneObject, "name_synonymes");
      Genes.insert(geneObject);
      this.genesCreated += 1;
    }

  }
};

HGNCGeneList.prototype.endOfFile = function () {
  // if (this.wranglerPeek) {
  //   var normalization_description = GeneExpression.simpleSchema()
  //       .schema()['values.' + this.wranglerFile.options.normalization].label;
  //
  //   this.insertWranglerDocument.call(this, {
  //     document_type: 'sample_normalization',
  //     contents: {
  //       sample_label: this.sample_label,
  //       normalization_description: normalization_description,
  //       gene_count: this.gene_count,
  //     }
  //   });
  // }

  return Q({genes_created: this.genesCreated});
};

// TODO: move to medbook:file-handlers, rename to FileHandlers
WranglerFileTypes.HGNCGeneList = HGNCGeneList;
