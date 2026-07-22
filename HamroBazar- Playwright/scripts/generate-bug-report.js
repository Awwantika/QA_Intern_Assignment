const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const bugs = require('./bugs-data');

const ROOT = path.join(__dirname, '..');
const CSV_OUTPUT = path.join(ROOT, 'HamroBazar-Bug-Report.csv');
const XLSX_OUTPUT = path.join(ROOT, 'HamroBazar-Bug-Report.xlsx');

const HEADERS = [
  'Bug ID',
  'Module',
  'Feature',
  'Title',
  'Severity',
  'Priority',
  'Status',
  'Type',
  'Related Test Case(s)',
  'Steps to Reproduce',
  'Expected Result',
  'Actual Result',
  'Environment',
  'Browser',
  'Evidence',
  'Reported By',
  'Report Date',
  'Comments',
];

const priorityColors = {
  P0: 'FFFDE7E7',
  P1: 'FFFFF8E1',
  P2: 'FFE8F5E9',
};

const statusColors = {
  Open: 'FFFFEBEE',
  Blocked: 'FFFFF3E0',
  Pending: 'FFE3F2FD',
  Closed: 'FFE8F5E9',
};

function escapeCsvField(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowFromBug(bug) {
  return [
    bug.id,
    bug.module,
    bug.feature,
    bug.title,
    bug.severity,
    bug.priority,
    bug.status,
    bug.type,
    bug.testCaseIds,
    bug.steps,
    bug.expected,
    bug.actual,
    bug.environment,
    bug.browser,
    bug.evidence,
    bug.reportedBy,
    bug.date,
    bug.comments,
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

  const sheet = workbook.addWorksheet('Bug Report', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  sheet.mergeCells(1, 1, 1, HEADERS.length);
  sheet.getCell(1, 1).value = 'HamroBazar — Bug Report by Module';
  sheet.getCell(1, 1).font = { bold: true, size: 14, color: { argb: 'FF1A237E' } };

  sheet.mergeCells(2, 1, 2, HEADERS.length);
  sheet.getCell(2, 1).value =
    'App: https://hamrobazaar.com  |  Generate: npm run qa:bugs  |  Last full test run: 26 passed, 5 failed, 1 skipped';
  sheet.getCell(2, 1).font = { italic: true, size: 10 };

  const headerRowIndex = 3;
  const headerRow = sheet.getRow(headerRowIndex);
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
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
    const priority = row[5];
    const status = row[6];
    const fillColor = statusColors[status] || priorityColors[priority] || 'FFFFFFFF';

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
    { width: 12 },
    { width: 12 },
    { width: 16 },
    { width: 36 },
    { width: 10 },
    { width: 9 },
    { width: 10 },
    { width: 16 },
    { width: 16 },
    { width: 36 },
    { width: 32 },
    { width: 32 },
    { width: 28 },
    { width: 18 },
    { width: 24 },
    { width: 14 },
    { width: 12 },
    { width: 28 },
  ];

  // Summary by module
  const summaryStart = headerRowIndex + rows.length + 2;
  sheet.getCell(`A${summaryStart}`).value = 'SUMMARY BY MODULE';
  sheet.getCell(`A${summaryStart}`).font = { bold: true, size: 12 };

  const modules = [...new Set(bugs.map((b) => b.module))].sort();
  modules.forEach((mod, i) => {
    const modBugs = bugs.filter((b) => b.module === mod);
    const openCount = modBugs.filter((b) => b.status === 'Open').length;
    sheet.getCell(`A${summaryStart + 1 + i}`).value = mod;
    sheet.getCell(`A${summaryStart + 1 + i}`).font = { bold: true };
    sheet.getCell(`B${summaryStart + 1 + i}`).value =
      `${modBugs.length} issue(s) — ${openCount} open`;
  });

  const legendStart = summaryStart + modules.length + 3;
  sheet.getCell(`A${legendStart}`).value = 'PRIORITY LEGEND';
  sheet.getCell(`A${legendStart}`).font = { bold: true };
  const legend = [
    ['P0', 'Critical — blocks release / core flow broken', priorityColors.P0],
    ['P1', 'Important — fix before release if possible', priorityColors.P1],
    ['P2', 'Low — can defer', priorityColors.P2],
  ];
  legend.forEach((item, i) => {
    const r = legendStart + 1 + i;
    sheet.getCell(`A${r}`).value = item[0];
    sheet.getCell(`A${r}`).font = { bold: true };
    sheet.getCell(`B${r}`).value = item[1];
    sheet.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item[2] } };
    sheet.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item[2] } };
  });

  // Module index sheet
  const index = workbook.addWorksheet('By Module');
  index.getCell('A1').value = 'Module';
  index.getCell('B1').value = 'Bug IDs';
  index.getCell('A1').font = { bold: true };
  index.getCell('B1').font = { bold: true };
  modules.forEach((mod, i) => {
    const ids = bugs.filter((b) => b.module === mod).map((b) => b.id).join(', ');
    index.getCell(`A${i + 2}`).value = mod;
    index.getCell(`B${i + 2}`).value = ids;
  });
  index.getColumn(1).width = 16;
  index.getColumn(2).width = 60;

  await workbook.xlsx.writeFile(XLSX_OUTPUT);
}

async function generate() {
  const rows = bugs.map(rowFromBug);
  writeCsv(rows);
  await writeXlsx(rows);
  console.log('Created:', CSV_OUTPUT);
  console.log('Created:', XLSX_OUTPUT);
  console.log('Bugs:', bugs.length);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
