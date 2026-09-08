const fs = require('fs');

const mobileCSS = `
/* --- MOBILE FIXES FOR SAMPLE REQUEST FORM --- */
@media (max-width: 768px) {
  /* 1. MOBILE FORM LAYOUT & 2. FIELD LAYOUT */
  .field-grid {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    gap: 16px !important;
  }
  
  .form-field {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    overflow: hidden !important;
  }

  /* 3. IMPORTANT — ANALYSIS REQUIRED LABEL */
  .form-field span {
    white-space: normal !important;
    word-wrap: break-word !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: block !important;
    line-height: 1.3 !important;
  }

  /* 5. DATE INPUTS & text inputs */
  .form-field input,
  .form-field textarea,
  .form-field select {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* 4. FORM CONTAINER safe spacing */
  .form-page form > fieldset {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding: 14px !important;
    overflow: hidden !important;
  }
  
  .reports-page, .form-page {
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }

  /* 6. SUBMIT BUTTON & 7. BACK BUTTON */
  .form-actions {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: flex !important;
    justify-content: flex-start !important;
  }

  .premium-submit-btn, .validate-button {
    max-width: 100% !important;
    box-sizing: border-box !important;
    white-space: normal !important;
    height: auto !important;
    min-height: 40px !important;
  }
}
`;

fs.appendFileSync('src/App.css', mobileCSS);
console.log("Appended mobile fixes to App.css");
