var patientsSchema = new SimpleSchema({
  // hidden from user
  "patient_label": { type: String }, // Patient_ID, ex. DTB-056
  "study_id": { type: Meteor.ObjectID },
  "study_label": { type: String },

  "on_study_date": { type: Date },
  "off_study_date": { type: Date, optional: true }, // if null, still on study

  // demographics
  "age": { type: Number, optional: true },
  "gender": { type: String, optional: true },
  "race" : { type: String, optional: true },
  "ethnicity" : { type: String, optional: true },
  "study_site": { type: String, optional: true },

  // clinical information
  "last_known_survival_status" : { type: String, optional: true },
  "neoplasm_disease_stage" : { type: String, optional: true },
  "pathology_T_stage" : { type: String, optional: true },
  "pathology_N_stage" : { type: String, optional: true },
  "pathology_M_stage" : { type: String, optional: true },
  "radiation_therapy" : { type: String, optional: true },
  "radiation_regimen_indication" : { type: String, optional: true },
  "completeness_of_resection" : { type: String, optional: true },
  "number_of_lymph_nodes" : { type: Number, optional: true },
  "gleason_grade" : { type: String, optional: true },
  "baseline_psa" : { type: Number, optional: true },
  "psa_nadir" : { type: Number, optional: true },
  "psa_nadir_days" : { type: Number, optional: true },
  "abiraterone_prior_to_study" : { type: String, optional: true },
  "enzaglutamide_prior_to_study" : { type: String, optional: true },

  "treatments": {
    type: [
      new SimpleSchema({
        // if day 3, they started 3 days after starting the trial
        "start_day": { type: Number, optional: true },
        "end_day": { type: Number, optional: true },
        "treatment_ongoing": { type: Boolean, optional: true },
        "sample_label": { type: String, optional: true },
        "description": { type: String, optional: true },
        "drug_names": { type: [String], optional: true },
        "reason_for_stop": { type: String, optional: true },
        "psa_response": { type: String, optional: true },
        "recist_response": { type: String, optional: true },
        "bone_response": { type: String, optional: true },
        "responder": { type: String, optional: true }, // could be resistant
        "treatment_category": { type: String, optional: true }, // ex. "Clinical Trial"
        "progressive_disease_type": { type: String, optional: true },
      })
    ],
    optional: true
  },

  "blood_labs": {
    type: [
      new SimpleSchema({
        "_id": { type: Meteor.ObjectID },
        "patient_id": { type: Meteor.ObjectID },
        "patient_label": { type: String },
        "study_id": { type: Meteor.ObjectID },
        "visit_date": { type: Date },
        "psa_level": { type: Number }, // optional?
      })
    ],
    optional: true
  },

  "samples": {
    type: [
      new SimpleSchema({
        "sample_label": { type: String }, // Sample_ID
        "site_of_biopsy" : { type: String, optional: true }, // changed from site_of_metastasis
        "procedure_day": { type: Number, optional: true },
        "gene_expression": {
          type: [
            new SimpleSchema({
              "gene_label": { type: String },
              "value": { type: Number }
            })
          ],
          optional: true
        }
      })
    ],
    optional: true
  }
});

var geneValuePair = new SimpleSchema({
  "gene_id": { type: String },
  "value": { type: Number }
});

var signaturesSchema = new SimpleSchema({
  // update with fields from cohortSignatureSchema (?)
  "description": { type: String }, // ABL1_kinase_viper_v4
  "type": { type: String },
  "algorithm": { type: String },
  "label": { type: String },
  "gene_label": { type: String, optional: true },
  "dense_weights": { type: [geneValuePair], optional: true },
  "sparse_weights": { type: [geneValuePair], optional: true },
  "version": { type: Number, optional: true },
});

var cohortSignatureSchema = new SimpleSchema({
  "signature_id": { type: Meteor.ObjectID, optional: true }, // should it be optional?
  "type": { type: String },
  "algorithm": { type: String },
  "label": { type: String },
  "samples": { // contains data
    type: [
      new SimpleSchema({
        "sample_label": { type: String },
        "value": { type: Number, decimal: true },
        // optional because we might not have a report for it
        "patient_label": { type: String, optional: true },
      })
    ]
  },

  "gene_label": { type: String, optional: true },
});

var studyAndCollaboration = new SimpleSchema({
  "study_label": { type: String },
  "collaboration_label": { type: String },
});

var superpathwaySchema = new SimpleSchema([
  studyAndCollaboration,
  {
    "name": { type: String },
    "version": { type: Number },
  },
]);
superpathwaySchema.fieldOrder = [
  "name",
  "version",
];

var superpathwayElementSchema = new SimpleSchema({
  "label": {
    type: String,
  },
  "type": {
    type: String,
    allowedValues: [
      "protein",
      "complex",
      "abstract",
      "family",
      "miRNA",
      "rna",
    ],
  },
  "superpathway_id": { type: String },
});
superpathwayElementSchema.fieldOrder = [
  "label",
  "type",
];

var superpathwayInteractionSchema = new SimpleSchema({
  "source": { type: String },
  "target": { type: String },
  "interaction": {
    type: String,
    allowedValues: [
      "-t>",
      "-t|",
      "-a>",
      "-a|",
      "-phos>",
      "PPI>",
    ],
  },
  "superpathway_id": { type: String },
});
superpathwayInteractionSchema.fieldOrder = [
  "source",
  "interaction",
  "target",
];


// var studiesSchema = new SimpleSchema({
//   "_id": { type: Meteor.ObjectID },
//   "study_label": { type: String },
//   "study_sites": { type: [String] },
//   "patient_ids": { type: [Meteor.ObjectID] },
// });

//
// TODO: do signatureAlgorithm primary collection schema
//

// Schemas.pathwayReportLink = new SimpleSchema({
//   "pathway_id": { type: String },
//   "pathway_label": { type: String }
// });
//
// Schemas.sampleInTrainingSet = new SimpleSchema({
//   patient_id": { type: String },
//   "sample_label": { type: String }
// });
//
// Schemas.trainingSet = new SimpleSchema({
//   "name": { type: String },
//   "group1": { type: String },
//   "group2": { type: String },
//   "list1": { type: [Schemas.sampleInTrainingSet] }, // probably not a String
//   "list1": { type: [Schemas.sampleInTrainingSet] }
//   // had collaborations field
// });
//
// Schemas.signatureAlgorithms = new SimpleSchema({
//   "signature_algorithm_label": { type: String }, // eg. small-cell
//   "value_type": { type: String }, // ex. kinase_viper
//   "signatures": { type: [Schemas.signature] },
//   "job_id": { type: String }, // refers to "jobs" collection (what generated this signatureReport)
//   "version_number": { type: String },
//   "top_pathways_enriched": { type: [Schemas.pathwayReportLink] },
//   "training_set": { type: Schemas.trainingSet }
// });

//
// pathways
//

// var pathwayElement = new SimpleSchema({
//   name: { type: String },
//   type: { type: String },
// });
//
// var pathwayInteraction = new SimpleSchema({
//   source: { type: String },
//   target: { type: String },
//   type: { type: String },
//   strength: { type: Number },
// });
//
// // get from report_collections: is it the same?
// var pathwaySchema = new SimpleSchema({
//   pathway_label: { type: String },
//   version: { type: Number, decimal: true },
//   source: { type: String, optional: true }, // URL
//   elements: { type: [pathwayElement]},
//   interactions: { type: [pathwayInteraction] },
// });

var mutationSchema = new SimpleSchema([
  studyAndCollaboration,
  {
    // required fields
    "gene_label": { type: String },
    "sample_label": { type: String },

    "chromosome": { type: String },
    "effect_impact": { type: String },

    "reference_allele": { type: String },
    "variant_allele": { type: [String] },

    "start_position": { type: Number },
    "end_position": { type: Number, optional: true },

    // user must input these manually
    "biological_source": {
      type: String,
      allowedValues: [
        "dna_normal",
        "dna_tumor",
        "rna_normal",
        "rna_tumor",
        "cellline"
      ],
    },

    // TODO: add these
    "protein_change": { type: String, optional: true },
    "mutation_type": { type: String, label: "SNP, MNP, INS, DEL, or COMPLEX" },
    "mutation_impact_assessor": { type: String },
    "mutation_impact": { type: String, optional: true },
    "mutation_impact_score": { type: Number, optional: true },

    "functional_class": { type: String, label: "MISSENSE, NONSENSE, or SILENT",optional: true },
    "read_depth": { type: Number, label: "Total read depth for all samples", optional:true }, // TODO: from DP (in fake switch statement)
    "genotype": { type: String, optional: true },

    // BELOW: other fields we will likely add
    // these fields are not yet handled by the parser

    "allele_count": { type: Number, label: "Allele count in genotypes, for each ALT allele, in the same order as listed", optional:true },
    "allele_frequency": { type: Number, decimal:true, label: "Allele frequency, for each ALT allele, in the same order as listed", optional:true },
    "allele_number": { type: Number, label: "Number of unique alleles across all samples", optional:true },
    "base_quality": { type: Number, decimal:true, label: "Overall average base quality", optional:true },

    // "genotype": { type: String } // GT string
    // "genotype_quality" // GQ string
    // "alternative_allele_observation" // AO  number
    // "reference_allele_observation" // RO
    // "biological_source": {
    //   type: String,
    //   allowedValues: [
    //     "dna_normal",
    //     "dna_tumor",
    //     "rna_tumor",
    //     "rna_tumor",
    //     "cellline"
    //   ],
    //   optional: true,
    // } // dna or rna String
    // "alternative_allele_quality": "probability that the ALT allele is incorrectly specified, expressed on the the phred scale (-10log10(probability))" // from QUAL
    // "qc_filter": { type: String, label: 'Either "PASS" or a semicolon-separated list of failed quality control filters' },

    "fraction_alt": { type: Number, decimal:true, label: "Overall fraction of reads supporting ALT", optional:true },
    "indel_number": { type: Number, label: "Number of indels for all samples", optional:true },
    "modification_base_changes": { type: String, label: "Modification base changes at this position", optional:true },
    "modification_types": { type: String, label: "Modification types at this position", optional:true },
    "sample_number": { type: Number, label: "Number of samples with data", optional:true },
    "origin": { type: String, label: "Where the call originated from, the tumor DNA, RNA, or both", optional:true },
    "strand_bias": { type: Number, decimal:true, label: "Overall strand bias", optional:true },
    "somatic": { type: Boolean, label: "Indicates if record is a somatic mutation", optional:true },
    "variant_status": { type: Number, label: "Variant status relative to non-adjacent Normal, 0=wildtype,1=germline,2=somatic,3=LOH,4=unknown,5=rnaEditing" , optional:true},
    "reads_at_start": { type: Number, label: "Number of reads starting at this position across all samples", optional:true },
    "reads_at_stop": { type: Number, label: "Number of reads stopping at this position across all samples", optional:true },
    "variant_type": { type: String, label: "Variant type, can be SNP, INS or DEL", optional:true },
    // "effects": {
    //   type: [
    //     new SimpleSchema({
    //
    //     });
    //   ]
    // }
    // "effects": { type: [Object], label:"Predicted effects Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_change| Amino_Acid_length | Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon  | GenotypeNum [ | ERRORS | WARNINGS ] )" , optional:true }
  }
]);
mutationSchema.fieldOrder = [
  // TODO: ugh
  "gene_label",
  "sample_label",
  "mutation_type",

  "effect_impact",

  "reference_allele",
  "variant_allele",

  "chromosome",
  "start_position",
  "end_position",
];

var normalizationSlugsAndNames = [
  { "value": "raw_counts", "label": "raw counts" },
  { "value": "counts", "label": "counts" },
  { "value": "fpkm", "label": "FPKM" },
  { "value": "tpm", "label": "TPM" },
  { "value": "rsem_quan_log2", "label": "RSEM log(2)" },
];

var geneExpressionSchema = new SimpleSchema([
  studyAndCollaboration,
  {
    "gene_label": { type: String },
    "sample_label": { type: String },
    "normalization": {
      type: String,
      allowedValues: _.pluck(normalizationSlugsAndNames, "value"),
      autoform: {
        options: normalizationSlugsAndNames,
      },
    },
    "value": { type: Number, decimal: true },
  }
]);
geneExpressionSchema.fieldOrder = [
  "gene_label",
  "sample_label",
  "normalization",
  "value",
];

// This is updated after importing new data from Wrangler
var geneExpressionSummarySchema = new SimpleSchema([
  studyAndCollaboration,
  {
    "gene_label": { type: String },
    "study_label": { type: String },
    "normalization": {
      type: String,
      allowedValues: _.pluck(normalizationSlugsAndNames, "value"),
    },
    "mean": { type: Number, decimal: true },
    "variance": { type: Number, decimal: true },
  }
]);

var jobSchema = new SimpleSchema({
  "name": { type: String },
  "user_id": { type: Meteor.ObjectID },
  "date_created": { type: Date },
  "date_modified": {
    type: Date,
    autoValue: function () {
      if (this.isSet) {
        return;
      }
      return new Date();
    },
  },
  "args": {
    type: Object,
    blackbox: true,
  },
  "status": {
    type: String,
    allowedValues: [
      "waiting",
      "running",
      "done",
      "error",
    ],
    defaultValue: "waiting",
  },
  "retry_count": { type: Number, defaultValue: 0 },
  // can be set even if status is not "error"
  "error_description": { type: String, optional: true },
  "prerequisite_job_id": { type: Meteor.ObjectID, optional: true },
});

//
// declare the collections
//

// we should have genes (already defined well)

Patients = new Meteor.Collection("patients");
Patients.attachSchema(patientsSchema);

Signatures = new Meteor.Collection("signatures");
Signatures.attachSchema(signaturesSchema);

// TODO: think about changing to signature_scores
CohortSignatures = new Meteor.Collection("cohort_signatures");
CohortSignatures.attachSchema(cohortSignatureSchema);

Mutations = new Meteor.Collection("mutations");
Mutations.attachSchema(mutationSchema);

GeneExpression = new Meteor.Collection("gene_expression");
GeneExpression.attachSchema(geneExpressionSchema);

GeneExpressionSummary = new Meteor.Collection("gene_expression_summary");
GeneExpressionSummary.attachSchema(geneExpressionSummarySchema);

// Pathways = new Meteor.Collection("pathways");
// Pathways.attachSchema(pathwaySchema);
//
// Studies = new Meteor.Collection("studies");
// Studies.attachSchema(studiesSchema);

Superpathways = new Meteor.Collection("superpathways");
Superpathways.attachSchema(superpathwaySchema);

SuperpathwayElements = new Meteor.Collection("superpathway_elements");
SuperpathwayElements.attachSchema(superpathwayElementSchema);

SuperpathwayInteractions = new Meteor.Collection("superpathway_interactions");
SuperpathwayInteractions.attachSchema(superpathwayInteractionSchema);

// not really data

Jobs = new Meteor.Collection("jobs");
Jobs.attachSchema(jobSchema);

Studies = new Meteor.Collection("studies");
Collaborations = new Meteor.Collection("collaboration");

// noooo there are no schemas for these
expression2 = new Meteor.Collection("expression2");
