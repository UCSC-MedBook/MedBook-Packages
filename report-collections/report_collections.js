// sorry for having everything in one file...

var mutationSchema = new SimpleSchema({ // used in PatientReports, GeneReports
  "gene_label": { type: String },
  "gene_id": { type: String },
  "protein_change": { type: String, optional: true },
  "mutation_type": { type: String }, // variant_classification for us
  "chromosome": { type: String },
  "start_position": { type: Number },
  "end_position": { type: Number },
  "reference_allele": { type: String },
  "variant_allele": { type: String },
  "MA_FImpact": { type: String, optional: true },
  "MA_FIS": { type: Number, optional: true }
});

var geneReportSchema = new SimpleSchema({
  "created_at": { type: Date },
  // "study_label": { type: String },
  // "study_id": { type: String },
  "gene_label": { type: String },
  "status": { type: String }, // ex. Approved / Symbol Withdrawn

  "network": {
    type: new SimpleSchema({
      "name": { type: String },
      "version": { type: Number, optional: true },
      // source url
      "elements": {
        type: [
          new SimpleSchema({
            "name": { type: String, },
            "type": { type: String },
            "position": {
                type: new SimpleSchema({
                    "x": { type: Number },
                    "y": { type: Number }
                }),
                optional: true
            },
          })
        ]
      },
      "interactions": {
          type: [
            new SimpleSchema({
              "source": { type: String },
              "target": { type: String },
              "type": { type: String },
              "score": { type: Number, optional: true }
          })
        ]
      },
    }),
  },


  // "description": { type: String, optional: true },
  // "previous": { type: [String], optional: true }, // need to send to client?
  // "synonym": { type: [String], optional: true }, // need to send to client?
  // "genome_browser_url": { type: String, optional: true },
  // "gene_cards_url": { type: String, optional: true },
  // "interaction_url": { type: String, optional: true },
  // "mutations": { // common mutations
  //   type: [mutationSchema],
  //   optional: true
  // },
  // "high_low_activity_samples": { type: [
  //   new SimpleSchema({
  //     "patient_id": { type: String },
  //     "sample_label": { type: String },
  //     "value": { type: Number },
  //   })
  // ], optional: true }

  // Lollipop (cbio or xena)
  // Gene-omics view (see next slide)
  // Circle map with first neighbors (next slide) ==> are we doing the superpathway?
  // slide 2 of 2 of the keynote
});


var signatureWeightSchema = new SimpleSchema({
  "gene_id": { type: String },
  "gene_label": { type: String },
  "weight": { type: String }, // not optional
  "pval": { type: String, optional: true } // do we need a p-value?
});

var signatureReportSchema = new SimpleSchema({
  "created_at": { type: Date },
  "signature_algorithm_id": { type: String },
  "signature_algorithm_label": { type: String },
  "studies": { type: new SimpleSchema({
      "study_id": { type: String },
      "study_label": { type: String },
    })
  },
  "value_type": { type: String },
  "sparse_weights": { type: [signatureWeightSchema] },
  "dense_weights": { type: [signatureWeightSchema] },
});

//
// pathway report
//

var pathwayReportSchema = new SimpleSchema({
  pathway_label: { type: String },
  version: { type: Number, decimal: true },
  source: { type: String, optional: true }, // URL

});

//
// patient report
//

// note on "_day" fields:
// These are numbers as counted from patient.n_study_date
var patientReportSchema = new SimpleSchema({
  // hidden from user
  "created_at": { type: Date },
  "patient_id": { type: Meteor.ObjectID }, // refers to "patients" collection
  "patient_label": { type: String }, // Patient_ID, ex. DTB-056

  "study_id": { type: Meteor.ObjectID },
  "study_label": { type: String },
  "study_site": { type: String, optional: true },
  "is_on_study": { type: Boolean, optional: true },

  // demographics
  "age": { type: Number, optional: true },
  "gender": { type: String, optional: true },
  "race": { type: String, optional: true },
  "ethnicity": { type: String, optional: true },

  // clinical information
  "last_known_survival_status": { type: String, optional: true },
  "neoplasm_disease_stage": { type: String, optional: true },
  "pathology_T_stage": { type: String, optional: true },
  "pathology_N_stage": { type: String, optional: true },
  "pathology_M_stage": { type: String, optional: true },
  "radiation_therapy": { type: String, optional: true },
  "radiation_regimen_indication": { type: String, optional: true },
  "completeness_of_resection": { type: String, optional: true },
  "number_of_lymph_nodes": { type: Number, optional: true },
  "gleason_grade": { type: String, optional: true },
  "baseline_psa": { type: Number, optional: true },
  "psa_nadir": { type: Number, optional: true },
  "psa_nadir_days": { type: Number, optional: true },

  // timeline
  "drug_resistance": {
    type: [
      new SimpleSchema({
        "date": { type: Date },
        "drug_name": { type: String },
        "resistance": { type: String },
      })
    ],
    optional: true
  },
  "psa_levels": {
    type: [
      new SimpleSchema({
        "day": { type: Number },
        "value": { type: Number },
        "blood_lab_id": { type: Meteor.ObjectID },
      })
    ],
    optional: true
  },
  "treatments": {
    type: [
      // pull from medbook:primary-collections
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

  "samples": {
    type: [
      new SimpleSchema({
        "sample_label": { type: String }, // Sample_ID
        "site_of_biopsy": { type: String, optional: true }, // changed from site_of_metastasis
        "procedure_day": { type: Number, optional: true },
        "trichotomy_call": { type: String, optional: true },
        // last-minute fields
        "abiraterone": { type: String, optional: true },
        "enzalutamide": { type: String, optional: true },
        "subsequent_treatments": { type: [String], optional: true },
        "prior_treatments": { type: [String], optional: true },

        "pathways": {
          type: [
            new SimpleSchema({
              "pathway_id": { type: String },
              "pathway_label": { type: String }, // ex. cell cycle
              "members": { type: [
                new SimpleSchema({
                  "name": { type: String },
                  "gene_id": { type: String, optional: true },
                  "events": { type: [String] }
                })
              ] }
            })
          ],
          optional: true
        },
        "mutations": { type: [mutationSchema], optional: true },
        "gene_sets": {
          type: [
            new SimpleSchema({
              "gene_set_label": { type: String },
              "members": { type: [
                new SimpleSchema({
                  "gene_label": { type: String },
                  "gene_id": { type: String },
                  // possibly other information
                })
              ] },
            })
          ],
          optional: true
        }
      })
    ],
    optional: true
  },
  "cohort_signature_ids": { type: [Meteor.ObjectID], optional: true },
});

//
// declare the collections
//

PatientReports = new Meteor.Collection("patient_reports");
PatientReports.attachSchema(patientReportSchema);

// what are we doing here?
SignatureReports = new Meteor.Collection("signature_reports");
SignatureReports.attachSchema(signatureReportSchema);

PathwayReports = new Meteor.Collection("pathway_reports");
PathwayReports.attachSchema(pathwayReportSchema);

GeneReports = new Meteor.Collection("gene_reports");
GeneReports.attachSchema(geneReportSchema);

// nooooooo
expression2 = new Meteor.Collection("expression2");
