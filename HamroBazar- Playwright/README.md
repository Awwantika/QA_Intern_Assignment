# HamroBazar Playwright QA Project

This project contains automated QA tests and supporting QA scripts for the HamroBazar web app.

It is focused on:
- smoke and regression checks
- critical user flows (homepage, search, auth, navigation, chat, categories)
- quick bug-report generation
- CI/CD execution through GitHub Actions

---

## 1) Prerequisites

Install these first:
- Node.js (recommended: 20+)
- npm
- Git

### Node.js setup (recommended)

If Node is not installed, use `nvm` so version management is easy.

macOS / Linux:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Then restart terminal and run:

```bash
nvm install 20
nvm use 20
node -v
npm -v
```

Windows:
- Install **nvm-windows** from the official release page:
  - [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
- Then in a new terminal:

```bash
nvm install 20
nvm use 20
node -v
npm -v
```

If `node -v` and `npm -v` show versions, setup is complete.

### Windows full setup (quick guide)

1. Install Git (if not installed):
   - [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Install Node.js using `nvm-windows` (recommended):
   - [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
3. Open **PowerShell** or **Command Prompt** and run:

```bash
nvm install 20
nvm use 20
node -v
npm -v
git --version
```

4. Go to project folder and install dependencies:

```bash
cd "C:\path\to\HamroBazar- Playwright"
npm ci
npx playwright install chromium ffmpeg
```

5. Run tests:

```bash
npx playwright test --workers=1
```

6. Open report:

```bash
npx playwright show-report
```

Then install project dependencies:

```bash
npm ci
```

Install Playwright browser binaries:

```bash
npx playwright install chromium ffmpeg
```

---

## 2) Project Structure (important folders)

- `tests/` -> Playwright test specs
- `pages/` -> page-object style locators/actions
- `scripts/` -> QA utilities (bug report, QA sheet, detailed test sheet)
- `.github/workflows/` -> CI/CD pipeline config

---

## 3) Main Test Commands

Run full suite:

```bash
npx playwright test --workers=1
```

Run full suite in visible browser:

```bash
npx playwright test --headed --workers=1
```

Open Playwright HTML report:

```bash
npx playwright show-report
```

Or with npm scripts:

```bash
npm test
npm run test:headed
npm run report
```

---

## 4) Targeted Test Commands

Examples:

```bash
npm run test:homepage
npm run test:search
npm run test:auth
npm run test:header
npm run test:footer
npm run test:category
npm run test:ad
npm run test:chat
npm run test:error
```

World Cup campaign targeted test:

```bash
npx playwright test tests/11-world-cup.spec.js --workers=1
```

---

## 5) QA Report / Bug Report Commands

Generate bug report files:

```bash
npm run qa:bugs
```

Generate and open browser bug dashboard:

```bash
npm run qa:bugs:view
```

Generate test case sheets:

```bash
npm run qa:sheet
npm run qa:detailed
```

---

## 6) CI/CD (GitHub Actions)

Workflow file:

- `.github/workflows/playwright.yml`

Pipeline behavior:
- CI runs on `push` and `pull_request` for `main`, `master`, `develop`
- Executes Playwright tests in stable mode (`--workers=1`)
- Uploads artifacts (`playwright-report`, `test-results`)
- CD deploys Playwright report to GitHub Pages on push to `main`

---

## 7) Recommended Local QA Flow

1. Pull latest code
2. Install deps: `npm ci`
3. Install browsers: `npx playwright install chromium ffmpeg`
4. Run regression: `npx playwright test --workers=1`
5. Review report: `npx playwright show-report`
6. Update bug/test artifacts if required

---

## 8) Common Troubleshooting

### `Executable doesn't exist` (Playwright)
Run:

```bash
npx playwright install chromium ffmpeg
```

### `EADDRINUSE: 9324` during `qa:bugs:view`
A previous local server is already running on that port. Close old process or open existing URL:

```text
http://localhost:9324
```

### Flaky navigation timeout
Re-run the failed spec once to confirm if it is intermittent:

```bash
npx playwright test <spec-file> --workers=1
```

---

## 9) Notes

- This repo intentionally uses single-worker execution for stability on dynamic production pages.
- CAPTCHA-protected login flows may be skipped/blocked in automation unless credentials and manual captcha handling are available.
