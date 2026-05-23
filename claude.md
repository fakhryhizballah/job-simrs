# Healthcare Data Integration Backend

This repository implements a **Node.js** backend that synchronizes hospital data with Indonesia's
national health system (SatuSehat/FHIR) and the BPJS insurance system.  The system is
designed around three core layers:

1. **Crawling** – orchestrates data extraction from the hospital database, transforms it
   into FHIR resources, and pushes the data to MongoDB and the SatuSehat API.
2. **Helpersfetch** – encapsulates HTTP clients for external services (SatuSehat, BPJS,
   SIRS) and handles authentication, caching, and rate‑limiting.
3. **Models** – Sequelize definitions for the hospital database and Mongoose schemas for
   FHIR resources.

The following sections provide a deeper look at each layer, the data flow, and common
patterns used throughout the codebase.

---

## 1. Crawling Layer

The `crawling/` directory contains modules that query the hospital database via Sequelize,
transform the results into FHIR resources, and persist them in MongoDB.  The main entry
point is `crawling/job.js`, which schedules all crawlers using `node-cron`.

| File | Responsibility |
|------|----------------|
| `job.js` | Orchestrates all sync jobs.
| `identitas.js` | Transforms patients, practitioners, and encounters.
| `icd.js` | Maps diagnoses and procedures to FHIR Condition/Procedure.
| `Medication.js` | Handles prescriptions and dispensing.
| `lab.js` | Converts laboratory results to Observation.
| `mapping.js` | Syncs reference data (Organization, Location) from SatuSehat.

### Data Flow

```
Hospital DB (Sequelize) → Crawling (transform) → MongoDB (Mongoose) → SatuSehat API
```

### Common Patterns

* **Date‑based processing** – every crawler accepts a `YYYY‑MM‑DD` date.
* **Upsert strategy** – uses `bulkWrite` with `replaceOne` + `upsert: true`.
* **Rate limiting** – 500‑2000 ms delay between API calls.
* **Error resilience** – continues on individual record failures and logs for retry.

---

## 2. Helpersfetch Layer

`helpersfetch/` contains HTTP clients that talk to external services.  Each client
manages its own authentication and caching strategy.

| Client | Auth | Cache | Key Functions |
|--------|------|-------|---------------|
| `satusehat.js` | OAuth2 | Redis (3.5 h TTL) | `auth()`, `postData()`, `postEncouter()` |
| `bpjs.js` | Custom headers (X‑rs‑id, X‑Timestamp, X‑Pass) | None | `addAntrean()`, `getPesertabyKatu()` |
| `siranap.js` | Signature‑based | None | `refKamar()`, `getKamar()` |

All responses are returned as **FHIR Bundles** (`{ total, response: entry[] }`).

---

## 3. Models Layer

The `models/` directory holds Sequelize definitions for the hospital database.  Key
models include:

* `pasien.js` – patient master
* `reg_periksa.js` – visit/registration
* `kamar_inap.js` – inpatient admission
* `diagnosa_pasien.js` – diagnoses
* `resep_obat.js` – prescriptions
* `satu_sehat_*` – mapping tables for FHIR resources

Mongoose schemas for FHIR resources live in `modelsMongoose/`.

---

## Common Development Tasks

* **Add a new FHIR resource** – create a crawler, update helpersfetch, and adjust
  Mongoose schemas.
* **Fix a transformation bug** – edit the relevant `crawling/*.js` file.
* **Debug API failures** – inspect `helpersfetch/*` clients and check authentication.
* **Add a new data source** – add a Sequelize model, a crawler, and integrate it
  into `job.js`.

---

## Running the Project

```bash
# Install dependencies
npm install

# Start the job scheduler
pm2 start ecosystem.config.js

# Run a single sync job for a specific date
node -e "const job = require('./crawling/job'); job.kirm('2026-01-08')"
```

Environment variables are defined in `.env` (not committed to the repo).  Key
variables include database credentials, MongoDB URI, Redis URI, and OAuth
credentials for SatuSehat.

---

## References

* [SatuSehat FHIR Specification](https://satusehat.kemkes.go.id/platform/docs/id/playbook/)
* [Sequelize Documentation](https://sequelize.org)
* [Mongoose Documentation](https://mongoosejs.com)
