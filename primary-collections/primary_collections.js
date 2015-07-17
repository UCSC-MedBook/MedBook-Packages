
var patients = new SimpleSchema({
  // hidden from user
  "_id": { type: Meteor.ObjectID },
  "patient_label": { type: String }, // Patient_ID, ex. DTB-056
  "study_id": { type: Meteor.ObjectID },
  "study_label": { type: String },
  "study_site": { type: String },

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

  // links elsewhere
  "blood_lab_ids": { type: [Meteor.ObjectID], optional: true },
  "treatment_ids": { type: [Meteor.ObjectID],  optional: true },
  "sample_ids": { type: [Meteor.ObjectID], optional: true },

  // We're never going to view a page with all of the patient information
  // (aka it should structured more like a SQL database than a Mongo database)
  // "patient_report_ids": { type: [Schemas.patientReportItem] }, // refers to "patient_reports" collection

  // Schemas.patientReportItem = new SimpleSchema({
  //   "created_at": { type: Date },
  //   "patient_report_id": { type: String }
  // });
});

var samples = new SimpleSchema({
  "_id": { type: Meteor.ObjectID },
  "sample_label": { type: String }, // Sample_ID
  "site_of_metastasis" : { type: String, optional: true },
  "procedure_day": { type: Number, optional: true },
  "pathways": {
    type: [Schemas.samplePathway],
    optional: true
  },
  "signature_types": {
    type: [Schemas.signatureType],
    optional: true
  },
  "mutations": { type: [Schemas.mutation], optional: true },
  "gene_sets": { type: [Schemas.geneSet], optional: true },
});

var treatments = new SimpleSchema({
  // if day 3, they started 3 days after starting the trial
  "start_day": { type: Number, optional: true },
  // if null --> still on treatment
  "end_day": { type: Number, optional: true },
  "description": { type: String, optional: true },
  "drug_name": { type: String, optional: true },
  "reason_for_stop": { type: String, optional: true },
  "psa_response": { type: String, optional: true },
  "bone_response": { type: String, optional: true },
  "category": { type: String, optional: true }, // ex. "Clinical Trial"
})

var bloodLabs = new SimpleSchema({
  "_id": { type: Meteor.ObjectID },
  "patient_id": { type: Meteor.ObjectID },
  "patient_label": { type: String },
  "study_id": { type: Meteor.ObjectID },
  "visit_date": { type: Date },
  "psa_level": { type: Number }, // optional?

  // TODO: ./run_variety.sh "Blood_Labs_V2"
});

var studies = new SimpleSchema({
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

Patients = new Meteor.Collection("patients");
Patients.attachSchema(patients);

Samples = new Meteor.Collection("samples");
Samples.attachSchema(samples);

Treatments = new Meteor.Collection("treatments");
Treatments.attachSchema(treatments);

BloodLabs = new Meteor.Collection("blood_labs");
BloodLabs.attachSchema(bloodLabs);

Studies = new Meteor.Collection("studies");
Studies.attachSchema(studies);
