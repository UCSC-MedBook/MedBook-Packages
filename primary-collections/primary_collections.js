
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

var networkElementSchema = new SimpleSchema({
  "network_label": { type: String }, // ex. "superpathway"
  "name": { type: String },
  "type": {
    type: String,
    allowedValues: [
      "protein",
      "complex",
      "abstract",
      "family",
    ],
  },
});

// this is a semi-temporary schema/collection:
// there is no need to store interactions without creating a report immidiately
var networkInteractionSchema = new SimpleSchema({
  "network_label": { type: String },
  "source": { type: String },
  "target": { type: String },
  "interaction": {
    type: String,
    allowedValues: [
      "-t>",
      "-t|",
      "-a>",
      "-a|",
    ],
  },
  "score": { type: Number, optional: true, decimal: true },
});


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

var mutationSchema = new SimpleSchema({ // used in PatientReports, GeneReports
  "gene_label": { type: String },
  "gene_id": { type: String },
  "sample_label": { type: String },
  "sample_id": { type: String },
  "protein_change": { type: String, optional: true },
  "mutation_type": { type: String }, // variant_classification for us
  "chromosome": { type: String },
  "start_position": { type: Number },
  "end_position": { type: Number, optional: true },
  "reference_allele": { type: String },
  "variant_allele": { type: [String] },
  "MA_FImpact": { type: String, optional: true },
  "MA_FIS": { type: Number, optional: true },
  "allele_count": { type: Number, label: "Allele count in genotypes, for each ALT allele, in the same order as listed", optional:true },
  "allele_frequency": { type: Number, decimal:true, label: "Allele frequency, for each ALT allele, in the same order as listed", optional:true },
  "allele_number": { type: Number, label: "Number of unique alleles across all samples", optional:true },
  "base_quality": { type: Number, decimal:true, label: "Overall average base quality", optional:true },
  "read_depth": { type: Number, label: "Total read depth for all samples", optional:true },
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
  "effects": { type: [Object], label: "Predicted effects Effect ( Effect_Impact | Functional_Class | Codon_Change | Amino_Acid_change| Amino_Acid_length | Gene_Name | Transcript_BioType | Gene_Coding | Transcript_ID | Exon  | GenotypeNum [ | ERRORS | WARNINGS ] )" , optional:true }

});

//
// declare the collections
//

// we should have genes (already defined well)

Patients = new Meteor.Collection("patients");
Patients.attachSchema(patientsSchema);

Signatures = new Meteor.Collection("signatures");
Signatures.attachSchema(signaturesSchema);

// TODO: change to signature_scores
CohortSignatures = new Meteor.Collection("cohort_signatures");
CohortSignatures.attachSchema(cohortSignatureSchema);

NetworkElements = new Meteor.Collection("network_elements");
NetworkElements.attachSchema(networkElementSchema);

// see note above about wanting to phase out this collection
NetworkInteractions = new Meteor.Collection("network_interactions");
NetworkInteractions.attachSchema(networkInteractionSchema);

Mutations = new Meteor.Collection("mutations");
Mutations.attachSchema(mutationSchema);

// Pathways = new Meteor.Collection("pathways");
// Pathways.attachSchema(pathwaySchema);
//
// Studies = new Meteor.Collection("studies");
// Studies.attachSchema(studiesSchema);
