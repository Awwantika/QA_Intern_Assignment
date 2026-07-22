const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const testCases = require('./test-cases-data');

const ROOT = path.join(__dirname, '..');
const CSV_OUTPUT = path.join(ROOT, 'HamroBazar-Test-Cases-Detailed.csv');
const XLSX_OUTPUT = path.join(ROOT, 'HamroBazar-Test-Cases-Detailed.xlsx');

const HEADERS = [
  'Test Case ID',
  'Test Type',
  'Module',
  'Feature',
  'Test Case Title',
  'Description',
  'Priority',
  'Preconditions',
  'Test Data',
  'Test Steps',
  'Expected Result',
  'Actual Result',
  'Status',
  'Pass/Fail',
  'Test Method',
  'Automation Script',
  'Environment',
  'Browser',
  'Tested By',
  'Test Date',
  'Defect/Bug ID',
  'Comments',
];

const priorityColors = {
  P0: 'FFFDE7E7',
  P1: 'FFFFF8E1',
  P2: 'FFE8F5E9',
};

function escapeCsvField(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowFromCase(tc) {
  return [
    tc.id,
    tc.type,
    tc.module,
    tc.feature,
    tc.title,
    tc.description,
    tc.priority,
    tc.preconditions,
    tc.testData,
    tc.steps,
    tc.expected,
    '',
    'Pending',
    '',
    tc.method,
    tc.script,
    'Production / Staging',
    'Chrome / Safari / Firefox',
    '',
    '',
    '',
    '',
  ];
}

function writeCsv(rows) {
  const lines = [HEADERS.map(escapeCsvField).join(',')];
  rows.forEach((row) => {
    lines.push(row.map(escapeCsvField).join(','));
  });
  fs.writeFileSync(CSV_OUTPUT, `${lines.join('\n')}\n`, 'utf8');
}

async function writeXlsx(rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HamroBazar Playwright QA';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Detailed Test Cases', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.mergeCells(1, 1, 1, HEADERS.length);
  sheet.getCell(1, 1).value = 'HamroBazar — Detailed Test Cases (30)';
  sheet.getCell(1, 1).font = { bold: true, size: 14, color: { argb: 'FF1A237E' } };

  sheet.mergeCells(2, 1, 2, HEADERS.length);
  sheet.getCell(2, 1).value =
    'App: https://hamrobazaar.com  |  Generate: npm run qa:detailed  |  Auto: npm run test:report';
  sheet.getCell(2, 1).font = { italic: true, size: 10 };

  const headerRowIndex = 3;
  const headerRow = sheet.getRow(headerRowIndex);
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
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
  headerRow.height = 28;

  rows.forEach((row, idx) => {
    const r = sheet.getRow(headerRowIndex + 1 + idx);
    const priority = row[6];
    const fillColor = priorityColors[priority] || 'FFFFFFFF';

    row.forEach((val, i) => {
      const cell = r.getCell(i + 1);
      cell.value = val;
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  });

  sheet.columns = [
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 16 },
    { width: 28 },
    { width: 36 },
    { width: 9 },
    { width: 28 },
    { width: 22 },
    { width: 36 },
    { width: 36 },
    { width: 24 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 28 },
    { width: 18 },
    { width: 22 },
    { width: 14 },
    { width: 12 },
    { width: 14 },
    { width: 24 },
  ];

  const legendStart = headerRowIndex + rows.length + 2;
  sheet.getCell(`A${legendStart}`).value = 'PRIORITY LEGEND';
  sheet.getCell(`A${legendStart}`).font = { bold: true };
  const legend = [
    ['P0', 'Must pass — blocks release', priorityColors.P0],
    ['P1', 'Important — fix before release if possible', priorityColors.P1],
    ['P2', 'Can defer', priorityColors.P2],
  ];
  legend.forEach((item, i) => {
    const r = legendStart + 1 + i;
    sheet.getCell(`A${r}`).value = item[0];
    sheet.getCell(`A${r}`).font = { bold: true };
    sheet.getCell(`B${r}`).value = item[1];
    sheet.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item[2] } };
    sheet.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item[2] } };
  });

  await workbook.xlsx.writeFile(XLSX_OUTPUT);
}

async function generate() {
  const rows = testCases.map(rowFromCase);
  writeCsv(rows);
  await writeXlsx(rows);
  console.log('Created:', CSV_OUTPUT);
  console.log('Created:', XLSX_OUTPUT);
  console.log('Test cases:', testCases.length);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
