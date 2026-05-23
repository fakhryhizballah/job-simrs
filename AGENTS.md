# Agent Instructions for Healthcare Data Integration Backend

## Project Overview

This is a **Node.js healthcare data integration system** that synchronizes hospital patient data with Indonesia's national health system (SatuSehat/FHIR) and insurance systems (BPJS). The system bridges three data ecosystems:

- **Hospital System** (Sequelize/MariaDB) — operational data
- **National Health** (MongoDB + SatuSehat FHIR API) — interoperability standard
- **Insurance** (BPJS) — claim and authorization tracking

**Tech Stack**: Node.js, Sequelize (MariaDB), Mongoose (MongoDB), Axios (HTTP), Redis (caching), node-cron (scheduling)

---

## 🏗️ Architecture: Three Key Layers

### 1. **Crawling/** — Data Orchestration & Transformation

**Purpose**: Orchestrates fetching hospital data, transforming to FHIR standard, and syncing with SatuSehat.

**Key Files**:
- **[crawling/job.js](crawling/job.js)** - Cron job orchestrator. Entry point for all data syncs. Call `kirm(date)` to trigger daily syncs.
- **[crawling/identitas.js](crawling/identitas.js)** - Patient/Practitioner/Encounter transformation. Queries `reg_periksa`, `pasien`, `pegawai` tables; transforms to FHIR Encounter/Patient/Practitioner.
- **[crawling/icd.js](crawling/icd.js)** - Condition & Procedure mapping. Uses ICD-10/ICD-9 codes from hospital diagnosis data.
- **[crawling/Medication.js](crawling/Medication.js)** - Medication/Prescription/Dispensing. Handles `resep_obat`, `detail_pemberian_obat` tables; maps to KFA (Indonesian medication database).
- **[crawling/lab.js](crawling/lab.js)** - Laboratory observations. Processes lab results into FHIR Observation.
- **[crawling/mapping.js](crawling/mapping.js)** - Reference data sync. Fetches Organization/Location from SatuSehat API.

**Data Flow Pattern**:
```
Hospital DB (Sequelize)
    ↓
Crawling Module (Transform to FHIR)
    ↓
MongoDB (FHIR storage via Mongoose)
    ↓
SatuSehat API (National sync)
```

**Common Patterns**:
- **Date-based Processing**: All modules accept `date` parameter (YYYY-MM-DD) to process data for specific day
- **Upsert Strategy**: Uses MongoDB `bulkWrite` with `replaceOne` + `upsert: true` for idempotency
- **Async Coordination**: 500-2000ms delays between API calls to prevent rate limiting
- **Error Resilience**: Gracefully continues if individual records fail; logs errors for retry

**When to Edit crawling/**:
- Adding new data types to sync (e.g., new clinical observations)
- Fixing FHIR transformation logic
- Modifying data flow or adding new orchestration steps
- Optimizing query performance or batch operations

---

### 2. **Helpersfetch/** — External API Integration & Caching

**Purpose**: Encapsulates HTTP requests to external systems with authentication and caching.

**Key Files**:
- **[helpersfetch/satusehat.js](helpersfetch/satusehat.js)** - SatuSehat FHIR API client
  - OAuth2 token management (Bearer Token)
  - Redis caching: auth tokens cached 3.5 hours (12600s)
  - Functions: `auth()`, `fetchSatusehat()`, `postData()`, `postEncouter()`, `getEncounterbyID()`
  - Returns FHIR Bundle format: `{total: N, response: entry[]}`
  
- **[helpersfetch/bpjs.js](helpersfetch/bpjs.js)** - BPJS insurance system client
  - Custom header authentication (X-rs-id, X-Timestamp, X-Pass)
  - Functions: `addAntrean()` (queue registration), `getPesertabyKatu()` (member lookup), `getRujukan()` (referral), `jddokter()` (physician list)
  
- **[helpersfetch/siranap.js](helpersfetch/siranap.js)** - Hospital room system (SIRS) client
  - Room/bed management: `refKamar()`, `getKamar()`, `updateKamar()`
  - Signature-based authentication

**Reference Data Files**:
- `condition.json` - Medical conditions/diagnoses reference
- `suhu.json` - Temperature classifications for vital signs

**Key Features**:
- **Caching Strategy**: Redis for expensive calls (OAuth tokens, frequently fetched reference data)
- **FHIR Compliance**: All responses structured as FHIR Bundles with `entry[]` array
- **Error Handling**: Returns consistent error structure `{total: 0, response: error_message}`
- **Rate Limiting**: Built-in delays between consecutive API calls

**When to Edit helpersfetch/**:
- Adding new external API integrations
- Fixing authentication/token issues
- Adjusting cache TTL or adding new cache keys
- Updating FHIR Bundle structure

---

### 3. **Models/** — Data Schema & ORM Definitions

**Purpose**: Sequelize models representing hospital database schema.

**Core Models** (commonly used in crawling):
- **[models/pasien.js](models/pasien.js)** - Patient master. Relations: kelurahan → kecamatan → kabupaten → propinsi (geographic hierarchy)
- **[models/reg_periksa.js](models/reg_periksa.js)** - Registration/visit record. Links to patient (no_rkm_medis), doctor (kd_dokter), clinic (kd_poli)
- **[models/kamar_inap.js](models/kamar_inap.js)** - Inpatient admission. Links to visit (no_rawat), room (kd_kamar). Tracks admission/discharge dates and status.
- **[models/kamar.js](models/kamar.js)** - Room master. Links to ward (kd_bangsal)
- **[models/bangsal.js](models/bangsal.js)** - Ward/department master

**Clinical Data Models**:
- `diagnosa_pasien.js` - Diagnoses. Links to ICD-10/ICD-9 codes and visits
- `penyakit.js` - Disease master
- `prosedur_pasien.js` - Procedures performed
- `icd10.js`, `icd9.js` - Medical classification codes

**Medication Models**:
- `resep_dokter.js` - Prescriptions (doctor orders)
- `resep_obat.js` - Prescription lines (individual medications)
- `detail_pemberian_obat.js` - Drug dispensing records
- `databarang.js` - Medication/supply inventory
- `satu_sehat_mapping_obat.js` - KFA (Indonesian medication database) mapping

**Integration Models**:
- `satu_sehat_encounter.js` - Encounter mapping to SatuSehat
- `satu_sehat_mapping_lokasi_ralan.js` - Outpatient location mapping
- `referensi_mobilejkn_bpjs_taskid.js` - BPJS task tracking for async callbacks
- `bridging_sep.js` - Insurance claim record

**Administrative Models**:
- `dokter.js`, `pegawai.js` - Staff master
- `poliklinik.js` - Clinic/department master
- `penjab.js` - Payment guarantor (BPJS, private, etc.)

**Model Association Pattern**:
```javascript
// Common relations used in crawling:
pasien.hasMany(reg_periksa, {foreignKey: 'no_rkm_medis'})
reg_periksa.hasMany(kamar_inap, {foreignKey: 'no_rawat'})
reg_periksa.hasMany(diagnosa_pasien, {foreignKey: 'no_rawat'})
kamar_inap.hasOne(kamar, {foreignKey: 'kd_kamar'})
```

**When to Edit models/**:
- Adding new database columns or tables
- Fixing model associations
- Updating validation rules
- Adding new computed properties or methods

---

## 🔗 Critical Data Structures & Identifiers

### Patient Journey Through System

```
Hospital Patient
    ↓
no_rkm_medis (Medical Record ID) 
    ↓
reg_periksa (Registration) → visit number: no_rawat
    ↓
kamar_inap (Inpatient) → room code: kd_kamar
    ↓
diagnosa_pasien (Diagnosis) → ICD-10 code
    ↓
resep_obat (Medication) → KFA code
```

### Unique Identifiers Across Systems

| System | Identifier | Type | Used In |
|--------|-----------|------|---------|
| Hospital | no_rkm_medis | String | pasien, reg_periksa (FK) |
| Hospital | no_rawat | String | Visit ID, links all visit data |
| SatuSehat | IHS_ID | UUID | FHIR Patient resource |
| BPJS | NIK | String | National ID for member lookup |
| KFA | kd_brng | String | Medication identifier |
| Hospital | kd_kamar | String | Room identifier |

### Common Data Structure: Encounter

From Sequelize (hospital) → Crawling (transform) → Mongoose (FHIR):

```javascript
// Source: reg_periksa + related tables
{
  no_rawat: "2026/01/08/000001",      // Visit ID
  no_rkm_medis: "123456",             // Patient ID
  tgl_registrasi: "2026-01-08",       // Visit date
  jam_reg: "08:30:00",
  kd_dokter: "D001",                  // Doctor ID
  kd_poli: "P001",                    // Clinic/department
  status_lanjut: "ranap" | "ralan",   // Inpatient or outpatient
  stts: "tidak batal"                 // Status
}

// Target: FHIR Encounter (SatuSehat format)
{
  resourceType: "Encounter",
  status: "arrived" | "finished",
  class: {system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB"},
  subject: {reference: "Patient/{IHS_ID}"},
  serviceProvider: {reference: "Organization/{org_id}"},
  location: [{location: {reference: "Location/{location_id}"}}],
  diagnosis: [{
    condition: {reference: "Condition/{condition_id}"},
    use: {coding: [{code: "DD"}]}
  }]
}
```

---

## 🎯 Common Development Tasks

### Task: Add a new FHIR resource type (e.g., Allergy)

**Steps**:
1. **Models**: Check if hospital DB has allergy data table. If not, skip or create mapping model.
2. **Crawling**: Create `crawling/allergy.js` with transformation function. Call from `job.js`.
3. **Helpersfetch**: Add POST endpoint to `helpersfetch/satusehat.js` if syncing to SatuSehat.
4. **Test**: Run with `job.kirm(date)` and verify MongoDB + SatuSehat sync.

### Task: Fix FHIR transformation bug

**Steps**:
1. Check relevant file in `crawling/` (identitas.js, icd.js, etc.)
2. Compare input (Sequelize query result) with FHIR specification
3. Update transformation logic
4. Test with actual data from hospital DB

### Task: Debug API call failures

**Steps**:
1. Check `helpersfetch/` for relevant API client (satusehat, bpjs, siranap)
2. Verify authentication (OAuth token, headers, signatures)
3. Check error response structure: `{total: 0, response: error}`
4. Review logs for rate limiting or timeout issues
5. Verify Redis cache isn't stale

### Task: Add new hospital data source

**Steps**:
1. Define Sequelize model in `models/` if not exists
2. Create crawling module (`crawling/new_module.js`) with date-based fetching
3. Add transformation to FHIR format
4. Integrate into `job.js` orchestration
5. Test with date range covering historical and new data

---

## ⚙️ Development & Testing

### Running Jobs

```bash
# Start the job scheduler (via ecosystem.config.js / PM2)
pm2 start ecosystem.config.js

# Test a single sync job with a date
node -e "const job = require('./crawling/job'); job.kirm('2026-01-08')"
```

### Environment Variables

Required in `.env`:
- `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_DIALECT` — Hospital database
- MongoDB connection string (in helpersfetch/satusehat.js)
- Redis connection string
- SatuSehat OAuth credentials (client_id, client_secret)
- BPJS credentials (for header authentication)

### Database Queries

Hospital DB (Sequelize):
```javascript
const { reg_periksa, pasien, diagnosa_pasien } = require('./models');
const visits = await reg_periksa.findAll({
  where: {tgl_registrasi: '2026-01-08'},
  include: [pasien, diagnosa_pasien]
});
```

MongoDB (Mongoose):
```javascript
const Encounter = require('modelsMongoose/Encounter');
const encounters = await Encounter.find({date: '2026-01-08'}).exec();
```

---

## 🔍 Key Patterns & Conventions

| Pattern | Where Used | Purpose |
|---------|-----------|---------|
| **Orchestrator** | `crawling/job.js` | Schedules multiple crawlers in sequence |
| **Adapter** | All `crawling/*.js` files | Transform hospital data to FHIR |
| **Upsert** | `crawling/identitas.js`, etc. | `bulkWrite({replaceOne: {..., upsert: true}})` prevents duplicates |
| **Caching** | `helpersfetch/satusehat.js` | Redis for expensive auth calls |
| **Lazy Loading** | `crawling/identitas.js` | Check local MongoDB first, fetch from SatuSehat if missing |
| **Error Resilience** | All `crawling/*.js` | Continue processing on individual record failure; log for retry |

---

## 📋 File Organization Quick Reference

```
crawling/           ← Data fetching & FHIR transformation
├── job.js          ← ENTRY POINT: Orchestrates all syncs
├── identitas.js     ← Encounter, Patient, Practitioner
├── icd.js          ← Condition, Procedure
├── Medication.js   ← MedicationRequest, MedicationDispense
├── lab.js          ← Observation (lab results)
├── obat.js         ← Medication master data
└── mapping.js      ← Organization, Location reference data

helpersfetch/       ← External API clients
├── satusehat.js    ← FHIR API (OAuth2, Redis cache)
├── bpjs.js         ← Insurance system
├── siranap.js      ← Hospital room system
├── condition.json  ← Reference data
└── suhu.json       ← Reference data

models/             ← Sequelize ORM models (Hospital DB)
├── pasien.js       ← Patient master
├── reg_periksa.js  ← Visit/registration
├── kamar_inap.js   ← Inpatient admission
├── diagnosa_pasien.js ← Diagnoses
├── resep_obat.js   ← Prescriptions
└── [60+ other models] ← All hospital data tables

config/
└── config.js       ← Sequelize database configuration

.env               ← DATABASE & API CREDENTIALS (not in repo)
```

---

## 🚨 Common Gotchas

1. **No Test Suite**: Project has no automated tests. Manual testing with real data required.
2. **Timezone Handling**: Hospital DB uses UTC+7 (Jakarta). Model queries include `timezone: '+07:00'`.
3. **Rate Limiting**: SatuSehat API requires delays between calls. Built into helpersfetch but can still timeout.
4. **Redis Cache Stale Data**: Auth tokens cached 3.5 hours. Manual cache clear needed for credential updates.
5. **FHIR Bundles**: All API responses must be FHIR Bundle format with `entry[]` array, not raw resources.
6. **KFA Mapping**: Not all hospital medications have KFA codes. Handling varies per crawling module.
7. **Async BPJS Callbacks**: Some BPJS operations trigger async callbacks. Tracked in `referensi_mobilejkn_bpjs_taskid`.

---

## 📚 References

- [SatuSehat FHIR Specification](https://satusehat.kemkes.go.id/platform/docs/id/playbook/) (external)
- [Restful API Reference](https://www.postman.com/satusehat/satusehat-public/collection/u2k8uiz/00-fhir-resource-contoh-penggunaan) (external)
- [Sequelize Documentation](https://sequelize.org) (external)
- [Mongoose Documentation](https://mongoosejs.com) (external)

