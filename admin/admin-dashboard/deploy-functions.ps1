# IDLab Admin Dashboard - Functions Deployment Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IDLab Functions Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$functionsDir = "$PSScriptRoot\functions"

# Check if functions directory exists
if (-not (Test-Path $functionsDir)) {
    Write-Host "ERROR: Functions directory not found!" -ForegroundColor Red
    exit 1
}

# Navigate to functions directory
Set-Location $functionsDir

Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Checking Firebase configuration..." -ForegroundColor Yellow
$emailUser = firebase functions:config:get email.user 2>$null
if ([string]::IsNullOrEmpty($emailUser) -or $emailUser -eq "{}") {
    Write-Host "⚠ WARNING: Email configuration not set!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please configure email settings using:" -ForegroundColor Yellow
    Write-Host 'firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"' -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Do you want to continue deployment anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✓ Email configuration found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Deploying functions to Firebase..." -ForegroundColor Yellow
Set-Location ..
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Functions Deployed Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following functions are now live:" -ForegroundColor Cyan
    Write-Host "  • sendLicenseEmail - Automatically sends email when payment approved" -ForegroundColor White
    Write-Host "  • resendLicenseEmail - Manual resend function" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Test by approving a payment in the admin dashboard" -ForegroundColor White
    Write-Host "  2. Check Firebase Console for function logs" -ForegroundColor White
    Write-Host "  3. Monitor email delivery" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    exit 1
}
