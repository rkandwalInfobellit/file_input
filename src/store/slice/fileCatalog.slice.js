import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { FILE_CATEGORY, APP, CLOUD, FILE_STATUS } from "./filterOptions.slice"

const DUMMY_FILES = [
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_rules",                 name: "aws_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v1.1",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "azure_rules",               name: "azure_rules.json",                category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.AZURE], version: "v2.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "gcp_rules",                 name: "gcp_rules.json",                  category: FILE_CATEGORY.BUSINESS_RULES, app: [APP.CCA],             cloud: [CLOUD.GCP],   version: "v1.0",       status: FILE_STATUS.REJECTED, file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_migration_paths",    name: "scaler_migration_paths.xlsx",     category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v2.9",       status: FILE_STATUS.PENDING , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_perf_improvements",  name: "scaler_perf_improvements.xlsx",   category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [],            version: "v1.5",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "scaler_new_instances_list", name: "scaler_new_instances_list.xlsx",  category: FILE_CATEGORY.SCALER_DATA,    app: [APP.CCA],             cloud: [CLOUD.AWS],   version: "v2.1",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_cca",name: "recommendation_remarks_CCA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.CCA],             cloud: [],            version: "v4.0",       status: FILE_STATUS.REVIEW  , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "recommendation_remarks_eia",name: "recommendation_remarks_EIA.xlsx", category: FILE_CATEGORY.REMARKS,        app: [APP.EIA],             cloud: [],            version: "v2.3",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "mrd_sept_2025",             name: "MRD_Sept_2025.pdf",               category: FILE_CATEGORY.MRD,            app: [APP.CCA, APP.EIA],    cloud: [],            version: "v1.0",       status: null                , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf" },
  { id: "power_carbon_data_epdw",    name: "power_carbon_data_EPDW.xlsx",     category: FILE_CATEGORY.SYSTEM_EPDW,   app: [APP.EIA],             cloud: [],            version: "v5.2",       status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_aws",         name: "h5_cloud_data_AWS.h5",            category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS],   version: "v8.2", status: FILE_STATUS.REVIEW   , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "h5_cloud_data_azure",       name: "h5_cloud_data_Azure.h5",          category: FILE_CATEGORY.SYSTEM_H5,     app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AZURE], version: "v5.2.7", status: null                 , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
  { id: "aws_pricing_pull",          name: "AWS pricing pull",                 category: FILE_CATEGORY.PRICING_AWS,   app: [APP.CCA, APP.EIA],    cloud: [CLOUD.AWS,CLOUD.AZURE],   version: "v9.89", status: FILE_STATUS.ROLLBACK , file: "https://cca-stage.amd.com/assets/CCA_Userguide.pdf"},
]

export const fetchFiles = createAsyncThunk(
  "fileCatalog/fetchFiles",
  async (_params = {}, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return DUMMY_FILES
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load files")
    }
  }
)

const initialState = {
  files: [],
  fetchStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  search: "",
  filters: {
    category: [], // multi-select → string[]
    app:      [], // multi-select → string[]
    cloud:    [], // multi-select → string[]
    status:   [], // multi-select → string[]
  },
}

const fileCatalogSlice = createSlice({
  name: "fileCatalog",
  initialState,
  reducers: {
    setSearch(state, action)         { state.search = action.payload },
    setCategoryFilter(state, action) { state.filters.category = action.payload },
    setAppFilter(state, action)      { state.filters.app = action.payload },
    setCloudFilter(state, action)    { state.filters.cloud = action.payload },
    setStatusFilter(state, action)   { state.filters.status = action.payload },
    clearFilters(state) {
      state.filters = { category: [], app: [], cloud: [], status: [] }
      state.search = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending,   (state)         => { state.fetchStatus = "loading";   state.error = null })
      .addCase(fetchFiles.fulfilled, (state, action) => { state.fetchStatus = "succeeded"; state.files = action.payload })
      .addCase(fetchFiles.rejected,  (state, action) => { state.fetchStatus = "failed";    state.error = action.payload || action.error.message })
  },
})

export const {
  setSearch,
  setCategoryFilter,
  setAppFilter,
  setCloudFilter,
  setStatusFilter,
  clearFilters,
} = fileCatalogSlice.actions

export default fileCatalogSlice.reducer
