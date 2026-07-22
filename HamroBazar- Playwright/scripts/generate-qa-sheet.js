const ExcelJS = require('exceljs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'HamroBazar-QA-Sheet-Google.xlsx');

const checks = [
  ['S1', 'Smoke', 'Homepage', 'Homepage loads', 'Open https://hamrobazaar.com', 'Page loads; title contains Hamrobazar', 'P0', 'Automated', '01-homepage', ''],
  ['S2', 'Smoke', 'Search', 'Search box visible', 'Look at top of homepage', 'Search input "Search for anything" is visible', 'P0', 'Automated', '01-homepage, 02-search', ''],
  ['S3', 'Smoke', 'Search', 'Search works', 'Type laptop → press Enter', 'Search results page opens with q=laptop', 'P0', 'Automated', '02-search', ''],
  ['S4', 'Smoke', 'Homepage', 'Trending section', 'Scroll homepage', 'Trending section shows ad listings', 'P0', 'Automated', '01-homepage', ''],
  ['S5', 'Smoke', 'Category', 'Category opens', 'Click any category (e.g. Mobile Phones)', 'Category page loads with listings', 'P0', 'Automated', '07-category', ''],
  ['S6', 'Smoke', 'Listing', 'Ad detail opens', 'Click any ad from homepage', 'Ad detail page opens (URL changes)', 'P0', 'Automated', '08-ad-detail', ''],
  ['S7', 'Smoke', 'Auth', 'Login page opens', 'Click Sign in / Sign up', 'Login page with phone + password fields', 'P0', 'Automated', '04-auth', ''],
  ['S8', 'Smoke', 'Navigation', 'FAQ page opens', 'Click FAQ (header or footer)', 'FAQ page loads', 'P0', 'Automated', '05-header, 06-footer', ''],
  ['S9', 'Smoke', 'Navigation', 'Contact page opens', 'Click Contact us', 'Contact page loads', 'P0', 'Automated', '05-header', ''],
  ['S10', 'Smoke', 'Footer', 'Footer legal pages', 'Click Terms / Privacy / Safety Tips', 'Each legal page loads without error', 'P0', 'Automated', '06-footer', ''],
  ['C1', 'Critical', 'Homepage', 'Homepage title and URL', 'Open /', 'Correct domain and title', 'P0', 'Automated', '01-homepage', ''],
  ['C2', 'Critical', 'Header', 'Header navigation complete', 'Verify Home, About boosting, FAQ, Contact, Sign in', 'All links visible and clickable', 'P0', 'Automated', '05-header', ''],
  ['C3', 'Critical', 'Homepage', 'Trending ads display', 'Check Trending section', 'At least one ad with title and price', 'P0', 'Automated', '01-homepage', ''],
  ['C4', 'Critical', 'Homepage', 'All Categories button', 'Click All Categories', 'Category menu or list appears', 'P1', 'Manual', '—', ''],
  ['C5', 'Critical', 'Homepage', 'Latest uploads section', 'Scroll homepage', 'Latest Uploads / Recommended section visible', 'P1', 'Manual', '—', ''],
  ['C6', 'Critical', 'Search', 'Search suggestions', 'Type iphone in search', 'Suggestions dropdown appears', 'P0', 'Automated', '02-search', ''],
  ['C7', 'Critical', 'Search', 'Search results page', 'Search laptop → Enter', 'Results page loads with relevant listings', 'P0', 'Automated', '02-search', ''],
  ['C8', 'Critical', 'Search', 'Empty search handling', 'Submit search with empty input', 'No crash; sensible behavior', 'P1', 'Manual', '—', ''],
  ['C9', 'Critical', 'Search', 'Special characters in search', 'Search @#$ or Nepali text', 'No error page; app does not break', 'P2', 'Manual', '—', ''],
  ['C10', 'Critical', 'Category', 'Mobile category', 'Open Mobile Phones & Accessories', 'URL contains /category/ and listings show', 'P0', 'Automated', '07-category', ''],
  ['C11', 'Critical', 'Category', 'Real Estate category', 'Open Real Estate', 'Category page loads with property listings', 'P0', 'Automated', '07-category', ''],
  ['C12', 'Critical', 'Category', 'Electronics category', 'Open Electronics, TVs, & More', 'Category page loads', 'P1', 'Automated', '07-category', ''],
  ['C13', 'Critical', 'Listing', 'Ad detail page content', 'Open any ad from homepage', 'Title, price, description or images visible', 'P0', 'Automated', '08-ad-detail', ''],
  ['C14', 'Critical', 'Listing', 'Ad page contact option', 'On ad detail, find contact/call button', 'Seller contact option available', 'P1', 'Manual', '—', ''],
  ['C15', 'Critical', 'Auth', 'Login form fields', 'Go to /login', 'Phone, password, Log In, Forgot password, Sign Up visible', 'P0', 'Automated', '04-auth', ''],
  ['C16', 'Critical', 'Auth', 'Sign up validation (empty)', 'Go to /signup, leave empty', 'Sign up button disabled', 'P0', 'Automated', '04-auth', ''],
  ['C17', 'Critical', 'Auth', 'Sign up form enable', 'Fill name, phone, password, accept terms', 'Sign up button becomes enabled', 'P0', 'Automated', '04-auth', ''],
  ['C18', 'Critical', 'Auth', 'Forgot password flow', 'Login → Forgot password', 'Forgot password page with phone field', 'P0', 'Automated', '04-auth', ''],
  ['C19', 'Critical', 'Auth', 'Invalid login feedback', 'Wrong phone/password + captcha', 'Clear error message; stay on login', 'P1', 'Manual', '—', 'reCAPTCHA required'],
  ['C20', 'Critical', 'Auth', 'Login → Sign up navigation', 'Login page → Sign Up link', 'Signup page opens', 'P0', 'Automated', '04-auth', ''],
];

const priorityColors = {
  P0: 'FFFDE7E7',
  P1: 'FFFFF8E1',
  P2: 'FFE8F5E9',
};

const statusOptions = ['Pending', 'Pass', 'Fail', 'Blocked', 'N/A'];

async function generate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HamroBazar Playwright QA';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('QA Checklist', {
    views: [{ state: 'frozen', ySplit: 4 }],
  });

  // Title block
  sheet.mergeCells('A1:N1');
  sheet.getCell('A1').value = 'HamroBazar — Master QA Sheet (Smoke + Critical)';
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF1A237E' } };
  sheet.getCell('A1').alignment = { vertical: 'middle' };

  sheet.mergeCells('A2:N2');
  sheet.getCell('A2').value = 'App: https://hamrobazaar.com  |  Total: 30 checks (10 Smoke + 20 Critical)  |  Auto run: npm run test:report';
  sheet.getCell('A2').font = { italic: true, size: 10 };

  const meta = [
    ['Tester', ''],
    ['Date', ''],
    ['Environment', 'Production / Staging'],
    ['Browser', 'Chrome / Safari / Firefox'],
  ];
  meta.forEach((row, i) => {
    sheet.getCell(`A${3 + i}`).value = row[0];
    sheet.getCell(`A${3 + i}`).font = { bold: true };
    sheet.mergeCells(`B${3 + i}:D${3 + i}`);
    sheet.getCell(`B${3 + i}`).value = row[1];
  });

  const headerRow = 8;
  const headers = [
    'ID', 'Type', 'Area', 'Check', 'Steps', 'Expected Result',
    'Priority', 'Method', 'Auto Test File', 'Status', 'Notes', 'Tester', 'Date', 'Ready?',
  ];

  const header = sheet.getRow(headerRow);
  headers.forEach((h, i) => {
    const cell = header.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  header.height = 28;

  checks.forEach((row, idx) => {
    const r = sheet.getRow(headerRow + 1 + idx);
    const fullRow = [...row.slice(0, 9), 'Pending', row[9] || '', '', '', ''];
    fullRow.forEach((val, i) => {
      const cell = r.getCell(i + 1);
      cell.value = val;
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });

    const priority = row[6];
    const fillColor = priorityColors[priority] || 'FFFFFFFF';
    for (let c = 1; c <= headers.length; c++) {
      r.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
    }

    // Status data validation
    r.getCell(10).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${statusOptions.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Invalid status',
      error: 'Choose: Pending, Pass, Fail, Blocked, N/A',
    };

    // Ready? column formula
    r.getCell(14).value = { formula: `IF(J${headerRow + 1 + idx}="Pass","Yes",IF(J${headerRow + 1 + idx}="","",IF(J${headerRow + 1 + idx}="N/A","N/A","No")))` };
  });

  // Summary section
  const summaryStart = headerRow + checks.length + 3;
  sheet.getCell(`A${summaryStart}`).value = 'SUMMARY';
  sheet.getCell(`A${summaryStart}`).font = { bold: true, size: 12 };

  const firstData = headerRow + 1;
  const lastData = headerRow + checks.length;
  const summaryRows = [
    ['Smoke checks (S1–S10)', { formula: `COUNTIF(J${firstData}:J${firstData + 9},"Pass")&" / 10 Pass"` }],
    ['Critical checks (C1–C20)', { formula: `COUNTIF(J${firstData + 10}:J${lastData},"Pass")&" / 20 Pass"` }],
    ['Total passed', { formula: `COUNTIF(J${firstData}:J${lastData},"Pass")&" / 30 Pass"` }],
    ['Total failed', { formula: `COUNTIF(J${firstData}:J${lastData},"Fail")` }],
    ['Release ready (all P0 pass)?', { formula: `IF(COUNTIFS(G${firstData}:G${lastData},"P0",J${firstData}:J${lastData},"<>Pass",J${firstData}:J${lastData},"<>N/A")=0,"YES","NO - fix P0 failures")` }],
  ];
  summaryRows.forEach((row, i) => {
    sheet.getCell(`A${summaryStart + 1 + i}`).value = row[0];
    sheet.getCell(`A${summaryStart + 1 + i}`).font = { bold: true };
    sheet.getCell(`B${summaryStart + 1 + i}`).value = row[1];
  });

  // Legend
  const legendStart = summaryStart + summaryRows.length + 2;
  sheet.getCell(`A${legendStart}`).value = 'PRIORITY LEGEND';
  sheet.getCell(`A${legendStart}`).font = { bold: true };
  const legend = [
    ['P0', 'Must pass — blocks release', 'FFFDE7E7'],
    ['P1', 'Important — fix before release if possible', 'FFFFF8E1'],
    ['P2', 'Can defer', 'FFE8F5E9'],
  ];
  legend.forEach((row, i) => {
    const r = legendStart + 1 + i;
    sheet.getCell(`A${r}`).value = row[0];
    sheet.getCell(`A${r}`).font = { bold: true };
    sheet.getCell(`B${r}`).value = row[1];
    sheet.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[2] } };
    sheet.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row[2] } };
  });

  // Column widths
  sheet.columns = [
    { width: 6 }, { width: 10 }, { width: 12 }, { width: 28 }, { width: 36 },
    { width: 36 }, { width: 9 }, { width: 11 }, { width: 22 }, { width: 11 },
    { width: 22 }, { width: 14 }, { width: 12 }, { width: 10 },
  ];

  // Instructions sheet
  const info = workbook.addWorksheet('How to use');
  const instructions = [
    ['HamroBazar QA Sheet — Google Sheets Instructions'],
    [''],
    ['OPTION 1: Upload to Google Sheets'],
    ['1. Go to https://sheets.google.com'],
    ['2. File → Import → Upload'],
    ['3. Select HamroBazar-QA-Sheet-Google.xlsx'],
    ['4. Choose "Replace spreadsheet" or "Insert new sheet"'],
    ['5. Click Import data'],
    [''],
    ['OPTION 2: Open in Excel then upload'],
    ['1. Open HamroBazar-QA-Sheet-Google.xlsx in Excel'],
    ['2. Upload to Google Drive → Open with Google Sheets'],
    [''],
    ['HOW TO USE'],
    ['• Mark Status column: Pending → Pass / Fail / Blocked / N/A'],
    ['• P0 rows are RED (must pass before release)'],
    ['• P1 rows are YELLOW (important)'],
    ['• P2 rows are GREEN (can defer)'],
    ['• Summary section auto-calculates pass counts'],
    [''],
    ['AUTOMATED TESTS'],
    ['cd "/Users/mercantile/Downloads/HamroBazar- Playwright"'],
    ['npm run test:report'],
    [''],
    ['Mark automated rows as Pass after npm test succeeds.'],
  ];
  instructions.forEach((row, i) => {
    info.getCell(`A${i + 1}`).value = row[0];
    if (i === 0) info.getCell(`A${i + 1}`).font = { bold: true, size: 14 };
  });
  info.getColumn(1).width = 70;

  await workbook.xlsx.writeFile(OUTPUT);
  console.log('Created:', OUTPUT);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
