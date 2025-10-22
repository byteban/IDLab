# IDLab Admin - Quick Setup for Email License System

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   IDLab Email License System - Quick Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$functionsDir = "$PSScriptRoot\functions"

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Firebase CLI
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "    Install with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Firebase
Write-Host ""
Write-Host "Step 2: Checking Firebase authentication..." -ForegroundColor Yellow
firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Not logged in to Firebase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Logging in to Firebase..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Firebase login failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  ✓ Firebase authenticated" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host ""
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
Set-Location $functionsDir
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Step 4: Email configuration
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Step 4: Email Service Configuration" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IDLab is configured to use Zoho Mail SMTP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current Configuration:" -ForegroundColor White
Write-Host "  • Email: contact@idlab.studio" -ForegroundColor Gray
Write-Host "  • SMTP: smtp.zoho.com (Port 465, SSL)" -ForegroundColor Gray
Write-Host "  • Status: Credentials hardcoded as fallback" -ForegroundColor Gray
Write-Host ""

Write-Host "Choose an option:" -ForegroundColor White
Write-Host "  1) Use Zoho configuration (set in Firebase config)" -ForegroundColor White
Write-Host "  2) Skip (use hardcoded fallback)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Zoho Mail Configuration" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Setting Zoho credentials in Firebase config..." -ForegroundColor Yellow
    Write-Host "(Email: contact@idlab.studio)" -ForegroundColor Gray
    Write-Host ""
    
    Set-Location ..
    firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Zoho email configuration saved!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Security Note:" -ForegroundColor Yellow
        Write-Host "  Credentials are now stored securely in Firebase config" -ForegroundColor White
        Write-Host "  The hardcoded fallback in code is only used if config fails" -ForegroundColor White
    } else {
        Write-Host "  ✗ Failed to save configuration!" -ForegroundColor Red
        Write-Host "  The system will use hardcoded fallback credentials" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "  ⚠ Skipping Firebase config setup" -ForegroundColor Yellow
    Write-Host "    System will use hardcoded Zoho credentials as fallback" -ForegroundColor White
    Write-Host "    Email: contact@idlab.studio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "    To set config later, run:" -ForegroundColor White
    Write-Host '    firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"' -ForegroundColor Gray
    Write-Host ""
}

# Step 5: Deploy
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Step 5: Deployment" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$deploy = Read-Host "Deploy Cloud Functions now? (y/n)"

if ($deploy -eq "y") {
    Write-Host ""
    Write-Host "Deploying functions..." -ForegroundColor Yellow
    Set-Location "$PSScriptRoot"
    firebase deploy --only functions
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  ✓ Functions deployed successfully!" -ForegroundColor Green
        
        Write-Host ""
        $deployHosting = Read-Host "Deploy hosting (admin dashboard) too? (y/n)"
        
        if ($deployHosting -eq "y") {
            firebase deploy --only hosting
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Hosting deployed successfully!" -ForegroundColor Green
            }
        }
    } else {
        Write-Host ""
        Write-Host "  ✗ Deployment failed!" -ForegroundColor Red
        Write-Host "    Check the errors above and try again." -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Skipping deployment" -ForegroundColor Yellow
    Write-Host "    Deploy later with: firebase deploy --only functions" -ForegroundColor White
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What's been configured:" -ForegroundColor White
Write-Host "  ✓ Cloud Functions for email sending" -ForegroundColor Green
Write-Host "  ✓ PDF receipt generation" -ForegroundColor Green
Write-Host "  ✓ Automatic email on payment approval" -ForegroundColor Green
Write-Host "  ✓ Manual resend functionality" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test by approving a payment in the admin dashboard" -ForegroundColor White
Write-Host "  2. Check email delivery" -ForegroundColor White
Write-Host "  3. Monitor Firebase Functions logs" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • Full guide: EMAIL_LICENSE_SYSTEM.md" -ForegroundColor White
Write-Host "  • Email setup: functions/EMAIL_SETUP.md" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  firebase deploy --only functions  # Deploy functions" -ForegroundColor White
Write-Host "  firebase deploy --only hosting    # Deploy dashboard" -ForegroundColor White
Write-Host "  firebase functions:log            # View logs" -ForegroundColor White
Write-Host "  .\deploy-functions.ps1            # Redeploy functions" -ForegroundColor White
Write-Host ""
Write-Host "Happy licensing! 🚀" -ForegroundColor Cyan
Write-Host ""
