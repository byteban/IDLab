# Quick Deploy - Zoho Email System
# Run this script to deploy the email license system

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   IDLab Zoho Email System - Quick Deploy" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Email Configuration:" -ForegroundColor Yellow
Write-Host "  Provider: Zoho Mail" -ForegroundColor White
Write-Host "  Email: contact@idlab.studio" -ForegroundColor White
Write-Host "  SMTP: smtp.zoho.com:465 (SSL)" -ForegroundColor White
Write-Host "  Status: Configured with fallback" -ForegroundColor Green
Write-Host ""

# Navigate to functions and install
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\functions"
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Ask about Firebase config
Write-Host "Would you like to set Zoho credentials in Firebase config?" -ForegroundColor Yellow
Write-Host "(Recommended for production, but fallback exists if skipped)" -ForegroundColor Gray
Write-Host ""
$setConfig = Read-Host "Set config? (y/n)"

if ($setConfig -eq "y") {
    Write-Host ""
    Write-Host "Setting Firebase config..." -ForegroundColor Yellow
    Set-Location ..
    firebase functions:config:set email.user="contact@idlab.studio" email.pass="ne29ctBqX5Hg"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Config set successfully" -ForegroundColor Green
    } else {
        Write-Host "Config failed, but fallback will work" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Skipping config - using hardcoded fallback" -ForegroundColor Yellow
    Set-Location ..
}

Write-Host ""
Write-Host "Deploying Cloud Functions..." -ForegroundColor Yellow
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   Deployment Successful!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Email system is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test it:" -ForegroundColor Yellow
    Write-Host "  1. Go to admin dashboard" -ForegroundColor White
    Write-Host "  2. Approve a payment" -ForegroundColor White
    Write-Host "  3. Check user email" -ForegroundColor White
    Write-Host ""
    Write-Host "Monitor:" -ForegroundColor Yellow
    Write-Host "  firebase functions:log" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Deployment failed!" -ForegroundColor Red
    Write-Host "Check errors above and try again" -ForegroundColor Yellow
    exit 1
}
