
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

  "treatments": {
    type: [
      new SimpleSchema({
        // if day 3, they started 3 days after starting the trial
        "start_day": { type: Number, optional: true },
        "end_day": { type: Number, optional: true }, // if null --> still on treatment
        "description": { type: String, optional: true },
        "drug_names": { type: [String], optional: true },
        "reason_for_stop": { type: String, optional: true },
        "psa_response": { type: String, optional: true },
        "recist_response": { type: String, optional: true },
        "bone_response": { type: String, optional: true },
        "response": { type: String, optional: true }, // could be resistant
        "category": { type: String, optional: true }, // ex. "Clinical Trial"
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
        // TODO: ./run_variety.sh "Blood_Labs_V2"
      })
    ],
    optional: true
  },

  "samples": {
    type: [
      new SimpleSchema({
        "sample_label": { type: String }, // Sample_ID
        "study_site": { type: String, optional: true },
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
        // // where are we going to store this stuff?
        // "pathways": {
        //   type: [Schemas.samplePathway],
        //   optional: true
        // },
        // "signature_types": {
        //   type: [Schemas.signatureType],
        //   optional: true
        // },
        // "mutations": { type: [Schemas.mutation], optional: true },
        // "gene_sets": { type: [Schemas.geneSet], optional: true },
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
  "signature_label": { type: String },
  "dense_weights": { type: [geneValuePair], optional: true },
  "sparse_weights": { type: [geneValuePair], optional: true },
  "version": { type: Number, optional: true }
});

var signatureScoresSchema = new SimpleSchema({
  "signature_id": { type: Meteor.ObjectID },
  "signature_label": { type: String },
  "description": { type: String, optional: true },
  "upper_threshold_value": { type: Number, decimal: true },
  "lower_threshold_value": { type: Number, decimal: true },
  "patient_values": { // contains data
    type: [
      new SimpleSchema({
        "sample_id": { type: String },
        "sample_label": { type: String },
        "value": { type: Number, decimal: true }
      })
    ]
  },

  // text to the left of the vertical axis
  "vertical_axis_text": { type: String, optional: true },
  "colors": {
    type: new SimpleSchema({
      "lower_than_threshold": { type: String },
      "higher_than_threshold": { type: String },
      "between_thresholds": { type: String },
    }),
    optional: true
  },

  // for if the charts within an algorithm should share scales
  "lowest_value_for_algorithm": { type: Number, optional: true },
  "highest_value_for_algorithm": { type: Number, optional: true },
});

var studiesSchema = new SimpleSchema({
  "_id": { type: Meteor.ObjectID },
  "study_label": { type: String },
  "study_sites": { type: [String] },
  "patient_ids": { type: [Meteor.ObjectID] },
});

//
// TODO: do signatureAlgorithm primary collection schema
//

// Schemas.pathwayReportLink = new SimpleSchema({
//   "pathway_id": { type: String },
//   "pathway_label": { type: String }
// });
//
// Schemas.sampleInTrainingSet = new SimpleSchema({
//   "sample_id": { type: String },
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

var pathwayElement = new SimpleSchema({
  name: { type: String },
  type: { type: String },
});

var pathwayInteraction = new SimpleSchema({
  source: { type: String },
  target: { type: String },
  type: { type: String },
  strength: { type: Number },
});

var pathwaySchema = new SimpleSchema({
  pathway_label: { type: String },
  version: { type: Number, decimal: true },
  source: { type: String, optional: true }, // URL
  elements: { type: [pathwayElement]},
  interactions: { type: [pathwayInteraction] },
});

//
// declare the collections
//

Patients = new Meteor.Collection("patients");
Patients.attachSchema(patientsSchema);

Studies = new Meteor.Collection("studies");
Studies.attachSchema(studiesSchema);

Signatures = new Meteor.Collection("signatures");
Signatures.attachSchema(signaturesSchema);

SignatureScores = new Meteor.Collection("signature_scores");
SignatureScores.attachSchema(signatureScoresSchema);

Pathways = new Meteor.Collection("pathways");
Pathways.attachSchema(pathwaySchema);
