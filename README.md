# Alltech Foundation Laboratory Test Report System

Implementation and integration specification for the React + Vite Laboratory Test Report application and its Express/MongoDB backend.

This document describes the current frontend behavior, implemented API contract, persistence model, security rules, and PDF workflow. The backend is implemented under `server/` and requires a running MongoDB instance plus the environment variables in `.env.example`.

## 1. Product scope

The application manages laboratory test reports for Alltech Foundation Laboratory Services.

The required business flow is:

```text
Login UI
  -> Reports List
  -> New Form or Edit
  -> Validate and Save
  -> Preview Report
  -> Print / Download PDF
```

Reports are independent records. Creating or editing one report must never overwrite another report.

The backend must provide:

- User accounts and login/session handling for the existing authentication UI.
- Authenticated, user-owned report records.
- Create, list, read, and update operations for reports.
- Validation equivalent to the frontend validation.
- PDF generation only for a report that has already been saved successfully.
- A PDF that keeps the existing supplied report layout, wording, typography, spacing, borders, header, table, signature/stamp, disclaimer, footer, and A4 dimensions.

The backend must not add an admin panel, analytics, email, OTP, dashboard, sharing, or other features unless requested separately.

## 2. Current frontend status (important)

### Technology

- React 19
- Vite 8
- IBM Plex Sans is used by the application/editor UI.
- The report itself uses Arial/Helvetica/Liberation Sans to match the supplied design.
- Express server source is under `server/src`.
- MongoDB/Mongoose persistence uses `User` and `Report` models.
- Authentication uses bcrypt password hashing and Mongo-backed HttpOnly sessions.
- `src/api.js` is the frontend API client; Vite proxies `/api` to `http://localhost:5000` during development.
- Playwright renders the persisted report into the final PDF.

### Current persistence

Reports are persisted by the backend in MongoDB and the API is the single source of truth. The old browser-storage key is no longer read or written by the application:

```text
laboratory-test-report-forms (legacy key; intentionally not migrated)
```

The legacy value, if present in an old browser profile, is intentionally ignored. The backend report document is shaped like the following (with MongoDB `_id`, `ownerId`, and timestamps added):

```json
{
  "id": "report-<timestamp>-<random>",
  "data": {
    "name": "",
    "address": "",
    "reportNo": "",
    "sampleReceiptDate": "2026-08-01",
    "sampleNameNo": "",
    "reportDate": "2026-08-04",
    "samplePacking": "",
    "tests": [
      {
        "parameter": "",
        "method": "",
        "result": "",
        "unit": "",
        "remark": ""
      }
    ]
  }
}
```

There is no hardcoded seed/mock report in the current code. A fresh user has an empty database list. Old browser records are not migrated or merged.

### Navigation

The app currently uses a React `page` state rather than URL routing. The page values are:

- `login`: Login UI.
- `signup`: Signup UI.
- `list`: Reports/Form List (the home page after a successful backend login).
- `form`: New or Edit Laboratory Report form.
- `preview`: Final report preview.

The current page state is not persisted. On reload the frontend calls `/api/auth/me`; authenticated users return to the Reports List and unauthenticated users see Login. Report records survive because of MongoDB.

## 3. Authentication UI currently implemented

The latest frontend includes the following screens. Signup and Login are wired to the backend; Forgot Password remains a visual placeholder because no reset workflow was requested.

### Login screen

- Uploaded Alltech logo.
- Alltech Foundation / Laboratory Test Report System branding.
- Email input (`type="email"`).
- Password input.
- Show/Hide password control.
- Remember me checkbox.
- Forgot Password button (visual control only; no behavior/API yet).
- Login button with disabled/loading state.
- Create Account link to Signup.
- Required-field and email-format validation.

Submitting a valid login calls `POST /api/auth/login`, establishes the HttpOnly session, loads the user's reports, and opens the Reports List.

### Signup screen

- Full Name.
- Email.
- Password with Show/Hide control.
- Confirm Password with Show/Hide control.
- Create Account button with disabled/loading state.
- Already have an account? Login link.
- Required-field, email-format, and password-match validation.

Submitting a valid Signup calls `POST /api/auth/signup`, persists the account with a bcrypt hash, and returns to Login. No plaintext password or confirmation password is stored.

### Authentication backend expectations

The existing UI has no password-strength rule. The backend should at minimum enforce non-empty passwords and may add a documented password policy when the frontend is updated to show the same rule.

`confirmPassword` is a client-side confirmation field and must not be stored in MongoDB.

`remember` should control session/token lifetime if Remember me is implemented. If it is not implemented in the first backend pass, document that limitation and keep the UI behavior consistent.

Forgot Password currently has no workflow. Do not claim it works until a reset-token/email flow is deliberately added.

## 4. Reports List / Home Page

After login, the home page shows:

- Uploaded Alltech logo in the header.
- Laboratory Test Report System title.
- Internal Laboratory Application subtitle.
- Logout button.
- `+ New Form` button.
- Existing reports table.

The table columns are in this order:

1. Name
2. Report No.
3. Sample Name
4. Date (the report date)
5. Action

Each saved row has:

- `Edit`: opens the same report data in the editable form.
- `View PDF`: opens the saved report preview.

There is currently no delete action, rename action, search, pagination, or sorting control. Do not add those routes or UI controls as part of this backend unless requested.

Logout clears frontend editing/validation state, invalidates the backend session, and returns to the Login UI. It does not delete reports.

## 5. Report form data contract

The form fields are rendered in this order:

| Key | Label | Input type | Required |
| --- | --- | --- | --- |
| `name` | Name | text | Yes |
| `address` | Address | text | Yes |
| `reportNo` | Report No. | text | Yes |
| `sampleReceiptDate` | Sample Receipt Date | date | Yes |
| `sampleNameNo` | Sample Name/No. | text | Yes |
| `reportDate` | Report Date | date | Yes |
| `samplePacking` | Sample Packing | text | Yes |

Each report must contain at least one test row. Every test row has all of these required string fields:

| Key | Label |
| --- | --- |
| `parameter` | Parameter |
| `method` | Method |
| `result` | Result |
| `unit` | Unit |
| `remark` | Remark |

Example request payload:

```json
{
  "name": "BKSK",
  "address": "Amritsar, Punjab.",
  "reportNo": "AF/26/1588",
  "sampleReceiptDate": "2026-08-01",
  "sampleNameNo": "DDGS",
  "reportDate": "2026-08-04",
  "samplePacking": "Zip-lock Pouch",
  "tests": [
    {
      "parameter": "Crude Protein",
      "method": "NIR",
      "result": "7.1",
      "unit": "% w/w",
      "remark": "-"
    }
  ]
}
```

### Frontend validation rules to preserve

The current `validate()` function:

- Trims each basic field and reports `<Label> is required.` when empty.
- Requires `tests.length > 0`.
- Trims every test-row value and reports `Required` for an empty cell.
- Does not currently validate date order, report-number format, maximum lengths, or numeric result format.
- Does not currently prevent removing the last row; submission then reports `Add at least one test row.`.

The backend must always validate independently. Do not rely on browser validation or client-side validation for security/data integrity. Return field-level errors so the frontend can display them beside the matching inputs.

Dates are sent by HTML date inputs as `YYYY-MM-DD`. The preview formats them as `DD.MM.YYYY`. Store dates as MongoDB date values or validated date-only values without changing the calendar day because of timezone conversion. A date-only string is often safest for this report.

## 6. Form and preview flow

### New report

1. User selects `+ New Form`.
2. A blank report is created in client state with one blank test row.
3. User fills the fields and can add/remove rows.
4. `Validate / Save` validates the full payload.
5. On success, the new report receives a persistent database ID and appears in the Reports List.
6. `Preview Report` becomes available.

### Edit report

1. User selects `Edit` for a row.
2. The complete saved payload is loaded, including every test row.
3. User may change basic fields, dates, sample information, or any test cell; rows can be added/removed.
4. `Save Changes` validates and updates only that report.
5. The updated record is used for preview/PDF generation.

### Preview

The preview page displays only the report and toolbar actions:

- `Back to Edit` keeps the current entered data.
- `Reports List` returns to the list.
- `Print / Download PDF` currently invokes browser `window.print()`.

When backend PDF generation is wired, download must use the persisted report ID and the latest successfully saved version. Unsaved edits must not be presented as a final downloadable PDF unless the save succeeds first.

## 7. Required backend API contract

Use `/api` as the API prefix. JSON responses should use a consistent shape, for example:

```json
{
  "success": true,
  "data": {}
}
```

Validation failures should use HTTP `400` and a shape such as:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "reportNo": "Report No. is required.",
    "tests.0.method": "Required"
  }
}
```

Recommended endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account; hash password; do not store confirmation password. |
| `POST` | `/api/auth/login` | Verify credentials and create a session/token. Accept `remember`. |
| `GET` | `/api/auth/me` | Return the current safe user profile/session status. |
| `POST` | `/api/auth/logout` | Invalidate/clear the current session or token. |
| `GET` | `/api/reports` | List reports belonging to the authenticated user. |
| `POST` | `/api/reports` | Validate and create one report. |
| `GET` | `/api/reports/:id` | Return one complete report for edit/preview. |
| `PUT` or `PATCH` | `/api/reports/:id` | Validate and update one existing report. |
| `GET` | `/api/reports/:id/pdf` | Generate/download the PDF only after confirming the report exists and is saved. |

The current UI does not need a delete endpoint. If deletion is added later, protect it with ownership checks and an explicit confirmation flow.

### API behavior and ownership

- All report endpoints require authentication once backend auth is enabled.
- Scope every query by the authenticated user's ID (`ownerId`); never trust an owner ID from the request body.
- `GET /api/reports` should return newest or most recently updated records in a stable order.
- `POST /api/reports` must return the created record ID and the saved report data.
- `PUT/PATCH` must return the updated record and must not mutate any other report.
- Accessing another user's report must return `404` (or a deliberately documented `403`) without leaking its existence.
- Report IDs returned to the browser may be MongoDB ObjectIds serialized as strings.
- Use appropriate status codes: `201` create, `200` read/update/download, `400` validation, `401` unauthenticated, `404` missing/unauthorized record, `409` duplicate email, `500` unexpected server error.

### Save-then-PDF rule

The final PDF workflow must be ordered and failure-safe:

```text
Validate request
  -> Save/update report in MongoDB
  -> Confirm successful persisted record
  -> Generate PDF from that persisted record
  -> Stream/download PDF
```

Never generate a final PDF from a failed save. The PDF endpoint must load the record from MongoDB rather than trusting an arbitrary unsaved body. If PDF generation fails, return an error and do not report a successful download; the saved report may remain available for retry.

## 8. MongoDB/Mongoose model

Use two collections at minimum: `users` and `reports`.

### User schema

```text
User
  fullName: String, required, trimmed
  email: String, required, lowercase, trimmed, unique, indexed
  passwordHash: String, required, select: false
  createdAt: Date
  updatedAt: Date
```

Do not store `password`, `confirmPassword`, or authentication tokens in the user document unless the chosen session design explicitly requires a token record.

### Report schema

```text
Report
  ownerId: ObjectId -> User, required, indexed
  name: String, required, trimmed
  address: String, required, trimmed
  reportNo: String, required, trimmed
  sampleReceiptDate: String or Date, required
  sampleNameNo: String, required, trimmed
  reportDate: String or Date, required
  samplePacking: String, required, trimmed
  tests: [
    {
      parameter: String, required, trimmed
      method: String, required, trimmed
      result: String, required, trimmed
      unit: String, required, trimmed
      remark: String, required, trimmed
    }
  ], required, minimum length 1
  createdAt: Date
  updatedAt: Date
```

Embedded test rows are appropriate because rows belong only to one report and are edited/saved together. Preserve row order exactly as received; the report table displays rows in array order.

Do not make `reportNo` globally unique unless the business explicitly requires that rule. If uniqueness is later required, define whether it is per user, per laboratory, or global and update the UI error handling.

## 9. Authentication/security implementation notes

- Hash passwords with a strong password-hashing function such as Argon2id or bcrypt.
- Never log passwords, password hashes, or session secrets.
- Prefer secure, HttpOnly, SameSite cookies for browser sessions, or use a carefully designed short-lived access/refresh-token approach.
- Configure CORS only for the frontend origin; do not use unrestricted `*` with credentials.
- Validate and trim all request data server-side.
- Add request body size limits and rate limiting for auth endpoints.
- Normalize email addresses before duplicate checks.
- Escape user content in the PDF renderer; do not build executable HTML from untrusted strings.
- Do not expose `passwordHash` in any response.
- Add ownership checks to every report read/update/PDF request.

## 10. Pixel-perfect report/PDF requirements

The `FigmaReportPreview` component is the active report preview. The older `ReportPreview` component remains in the source but is unused; backend PDF work should follow the active Figma-style structure, not the legacy component.

The report contains, in this order:

1. Alltech logo/header area.
2. `Laboratory Services` title.
3. Orange divider with the supplied border treatment.
4. Underlined `TEST REPORT` title.
5. Name and address.
6. Report information: report number, sample name/number, sample packing, sample receipt date, report date.
7. Results table with `Parameter`, `Method`, `Result`, `Unit`, `Remark` columns.
8. Section rule.
9. `Authorised Signatory,` and the supplied Alltech Foundation Pune stamp image.
10. Exact disclaimer text.
11. Registered-office footer and page number.

Important current assets:

- Home/header logo: `Alltech Logo.avif`.
- Report logo asset: `src/assets/Alltech-Logo.avif`.
- Signature/stamp source: `21aec37710d94a55a24d470aa9cb64cb_gemini-3.1-flash-image-preview.jpg`.
- Existing report CSS and layout: `src/App.css`, `.figma-report` and related `.figma-*` selectors.

Do not regenerate, redraw, replace, crop differently, or “modernize” these assets as part of backend work.

### Existing report dimensions/styles

- Screen report base: `794px` wide and at least `1123px` high.
- Print page: `210mm x 297mm` (A4).
- Print `@page` margin: `0`.
- Print report uses fixed millimetre sizing, `zoom: 1`, no transform, and exact print-color adjustment.
- Print UI controls, navigation, editor, and other application elements are hidden.
- Header, table, rows, signature, disclaimer, footer, and page number have fixed spacing/positions in the current CSS.

### Recommended server-side PDF approach

Use a real browser renderer such as Playwright or Puppeteer with a dedicated report HTML template that shares the same measured values and assets. Configure:

- `printBackground: true`.
- CSS `@page { size: 210mm 297mm; margin: 0; }`.
- No browser header/footer display.
- Scale `1` / 100%.
- Local asset URLs or embedded assets that are available to the renderer.
- Wait for all fonts and images before generating the PDF.

Do not use a generic document/PDF library that reflows the table and footer if the goal is to match the supplied PDF. Compare generated output against the existing browser print preview at 100%.

The current report is designed around the normal seven-row example. The frontend allows dynamic rows, so the backend renderer must preserve row order and handle additional rows deliberately. Do not silently shrink fonts or alter the first-page layout. If more rows cannot fit on the original page, define and test a documented overflow/multi-page rule before changing the template.

The footer/disclaimer must not overlap the table or signatory. Verify the final PDF with short, normal, and long text values and with the expected number of rows.

## 11. Frontend-to-backend integration changes

The backend integration has been completed in this order:

1. Add one API client module with a configurable base URL (`src/api.js`).
2. Replace `loadSavedReports()` localStorage initialization with `GET /api/reports` after authenticated session restoration.
3. Wire Login to `POST /api/auth/login`; show server errors without exposing sensitive details.
4. Wire Signup to `POST /api/auth/signup`; on success return to Login or establish the documented session.
5. Wire Logout to `POST /api/auth/logout` and clear client user/session state.
6. Wire new-report save to `POST /api/reports`.
7. Wire edit save to `PUT/PATCH /api/reports/:id`.
8. Refresh/update the list from the API after saves.
9. Keep Back to Edit data intact and use the selected persisted report for preview.
10. Replace browser-only final download with the saved-record PDF endpoint when server PDF generation is enabled.

The frontend does not write report data to localStorage. No automatic migration or merge exists by design.

## 12. Suggested backend project structure

```text
server/
  src/
    app.js
    server.js
    config/
      db.js
      env.js
    models/
      User.js
      Report.js
    routes/
      auth.routes.js
      report.routes.js
    controllers/
      auth.controller.js
      report.controller.js
    middleware/
      auth.js
      errorHandler.js
      validate.js
    validators/
      auth.validators.js
      report.validators.js
    services/
      auth.service.js
      report.service.js
      pdf.service.js
    templates/
      laboratory-report.html
      laboratory-report.css
    assets/
      Alltech-Logo.avif
      signature-stamp.jpg
  .env.example
```

The exact folder structure is flexible. Keep PDF template/CSS changes isolated from API and database code so pixel-level adjustments do not affect report persistence.

## 13. Environment variables

At minimum, document these in the backend `.env.example`:

```text
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/laboratory_reports
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace-with-a-long-random-secret
```

If JWT or an external mail provider is selected, document its variables without committing secrets. Never commit `.env` files.

## 14. Backend acceptance checklist

### Authentication

- [ ] Signup rejects missing/invalid fields and duplicate email.
- [ ] Password is hashed and never returned.
- [ ] Login rejects incorrect credentials with a safe error.
- [ ] Login establishes the documented session/token.
- [ ] Logout invalidates the session/token.
- [ ] Unauthenticated users cannot access report APIs.
- [ ] Signup/Login UI navigation still works on desktop, tablet, and mobile.

### Reports

- [ ] A blank New Form starts with one blank test row.
- [ ] All seven basic fields are persisted.
- [ ] At least one test row is required.
- [ ] Every test row field is persisted, including `remark`.
- [ ] Add Row and Remove Row preserve array order.
- [ ] One user's reports are isolated from another user's reports.
- [ ] New reports never overwrite an existing report.
- [ ] Editing one report never changes another report.
- [ ] Dates preserve their date-only value and display as `DD.MM.YYYY`.
- [ ] List shows Name first, then Report No., Sample Name, Date, and actions.
- [ ] Back to Edit restores all previously entered values.
- [ ] No mock/seed report is inserted by the backend.

### PDF

- [ ] PDF generation is possible only for an existing saved report.
- [ ] A failed database save never triggers PDF generation/download.
- [ ] PDF data comes from the persisted report, not an unsaved client payload.
- [ ] PDF is A4 `210mm x 297mm` with zero page margins.
- [ ] Header/logo, title, orange divider, fonts, spacing, table columns, borders, rows, signatory stamp, disclaimer, footer, and page number match the reference.
- [ ] Buttons/navigation/editor UI are absent from the PDF.
- [ ] Print colors/backgrounds are preserved.
- [ ] Normal report output has no overlapping footer, disclaimer, signature, or table.
- [ ] Long values and the dynamic-row behavior are tested without silently changing the reference layout.

### Quality

- [ ] API errors use one documented response format.
- [ ] Ownership and authorization are tested for every report endpoint.
- [ ] No password or secret appears in logs/responses.
- [ ] Frontend build and lint still pass after API integration.
- [ ] Backend tests cover validation, auth, ownership, save/update, and PDF failure ordering.

## 15. Current frontend verification commands

From the repository root:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run server
```

The frontend build/lint and backend syntax/API/PDF smoke checks pass. A complete database-backed flow requires MongoDB to be running. Start the backend with `npm.cmd run server` after configuring `.env`; it fails with a clear connection error if MongoDB is unavailable. Backend work must not alter the existing report CSS without a deliberate pixel-comparison review.
