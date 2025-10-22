# Deploy Email Fixes to Firebase
# Run this script from the admin/admin-dashboard directory

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   IDLab - Deploying Email System Fixes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "firebase.json")) {
    Write-Host "ERROR: firebase.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the admin/admin-dashboard directory" -ForegroundColor Yellow
    exit 1
}

# Step 1: Install dependencies
Write-Host "[1/3] Installing Cloud Function dependencies..." -ForegroundColor Yellow
Push-Location functions
npm install
Pop-Location
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Cloud Functions
Write-Host "[2/3] Deploying Cloud Functions..." -ForegroundColor Yellow
Write-Host "This will deploy:" -ForegroundColor Gray
Write-Host "  - sendLicenseEmail (payment approval emails)" -ForegroundColor Gray
Write-Host "  - sendApprovalNotification (new - approval notifications)" -ForegroundColor Gray
Write-Host "  - resendLicenseEmail (manual resend)" -ForegroundColor Gray
Write-Host ""

firebase deploy --only functions

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cloud Functions deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Cloud Functions deployed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy Hosting (Dashboard UI)
Write-Host "[3/3] Deploying Dashboard UI..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Hosting deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dashboard UI deployed successfully" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "================================================" -ForegroundColor Green
Write-Host "   🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "What's Fixed:" -ForegroundColor Cyan
Write-Host "  ✓ License request approvals now send emails" -ForegroundColor White
Write-Host "  ✓ Approval notifications now send emails" -ForegroundColor White
Write-Host "  ✓ Users receive license keys and PDF receipts" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test by approving a license request" -ForegroundColor White
Write-Host "  2. Check user email for license key" -ForegroundColor White
Write-Host "  3. Monitor logs: firebase functions:log" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  firebase functions:log" -ForegroundColor Gray
Write-Host ""
Write-Host "Check for errors:" -ForegroundColor Yellow
Write-Host "  Go to Firestore > email_errors collection" -ForegroundColor Gray
Write-Host ""
