
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
        "drug_name": { type: [String], optional: true },
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
  "sample_values": { // contains data
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

// get from report_collections: is it the same?
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

// we should have genes (already defined well)

Patients = new Meteor.Collection("patients");
Patients.attachSchema(patientsSchema);

Studies = new Meteor.Collection("studies");
Studies.attachSchema(studiesSchema);

Signatures = new Meteor.Collection("signatures");
Signatures.attachSchema(signaturesSchema);

CohortSignatures = new Meteor.Collection("cohort_signatures"); // TODO: change to signature_scores
CohortSignatures.attachSchema(cohortSignatureSchema);

Pathways = new Meteor.Collection("pathways");
Pathways.attachSchema(pathwaySchema);
