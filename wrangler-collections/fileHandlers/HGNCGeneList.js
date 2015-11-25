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

HGNCGeneList.prototype.parseLine =
    function (brokenTabs, lineNumber, line) {
  if (lineNumber % 10 === 0) {
    console.log("lineNumber:", lineNumber);
  }

  if (lineNumber === 1) { // header line
    // if (this.wranglerPeek) {
    //   this.gene_count = 0;
    // }
    //
    // this.setSampleLabel.call(this, brokenTabs[1]);
  } else { // rest of file

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

  return Q({genes_created: 15});
};

// TODO: move to medbook:file-handlers, rename to FileHandlers
WranglerFileTypes.HGNCGeneList = HGNCGeneList;
