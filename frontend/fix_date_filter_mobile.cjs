const fs = require('fs');

const dateFilterMobileCSS = `
/* --- MOBILE FIXES FOR DATE FILTER ALIGNMENT --- */
@media (max-width: 768px) {
  .date-filter-inputs {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
  }
  
  .date-filter-inputs label {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    width: 100% !important;
    gap: 8px !important;
    box-sizing: border-box !important;
  }
  
  .date-filter-inputs label span {
    width: 45px !important;
    min-width: 45px !important;
    flex-shrink: 0 !important;
    text-align: left !important;
  }
  
  .date-filter-inputs input[type="date"] {
    flex: 1 1 auto !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
`;

fs.appendFileSync('src/App.css', dateFilterMobileCSS);
console.log("Appended mobile fixes for date filter to App.css");
