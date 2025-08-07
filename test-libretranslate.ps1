# LibreTranslate Test Runner
# PowerShell script to test LibreTranslate functionality

Write-Host "🚀 LibreTranslate Test Suite" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "`n1. Running Quick LibreTranslate Test..." -ForegroundColor Yellow
Write-Host "-" * 40 -ForegroundColor Gray

try {
    node quick-libretranslate-test.js
    Write-Host "`n✅ Quick test completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Quick test failed: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing LibreTranslate Service Integration..." -ForegroundColor Yellow
Write-Host "-" * 40 -ForegroundColor Gray

# Check if the LibreTranslate service file exists
if (Test-Path "src/services/libreTranslateService.ts") {
    Write-Host "✅ LibreTranslate service file found" -ForegroundColor Green
} else {
    Write-Host "❌ LibreTranslate service file not found at src/services/libreTranslateService.ts" -ForegroundColor Red
}

# Check if translation context exists
if (Test-Path "src/contexts/EnhancedTranslationContext.tsx") {
    Write-Host "✅ Enhanced Translation Context found" -ForegroundColor Green
} else {
    Write-Host "❌ Enhanced Translation Context not found" -ForegroundColor Red
}

# Check if translation components exist
if (Test-Path "src/components/TranslationComponents.tsx") {
    Write-Host "✅ Translation Components found" -ForegroundColor Green
} else {
    Write-Host "❌ Translation Components not found" -ForegroundColor Red
}

Write-Host "`n3. Checking Project Dependencies..." -ForegroundColor Yellow
Write-Host "-" * 40 -ForegroundColor Gray

# Check if the project can build
Write-Host "Building project to check for TypeScript errors..." -ForegroundColor Blue
try {
    $buildResult = bun run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project builds successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Project build failed:" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Could not run build command. Make sure bun is installed." -ForegroundColor Yellow
}

Write-Host "`n4. LibreTranslate Integration Status:" -ForegroundColor Yellow
Write-Host "-" * 40 -ForegroundColor Gray

# List files that should have LibreTranslate integration
$integratedFiles = @(
    "src/pages/Index.tsx",
    "src/pages/Login.tsx", 
    "src/pages/Register.tsx",
    "src/pages/BatchManagement.tsx"
)

foreach ($file in $integratedFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "bt\(" -or $content -match "LibreTranslate" -or $content -match "LanguageToggle") {
            Write-Host "✅ $file - LibreTranslate integrated" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $file - No LibreTranslate integration detected" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $file - File not found" -ForegroundColor Red
    }
}

Write-Host "`n5. Network Connectivity Test:" -ForegroundColor Yellow
Write-Host "-" * 40 -ForegroundColor Gray

# Test connectivity to LibreTranslate services
$testUrls = @(
    "https://libretranslate.com",
    "https://translate.argosopentech.com"
)

foreach ($url in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $url - Accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $url - Response code: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $url - Not accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan
Write-Host "• Quick test completed - Check output above" -ForegroundColor White
Write-Host "• Service files checked - Verify integration status" -ForegroundColor White
Write-Host "• Project build status verified" -ForegroundColor White
Write-Host "• Network connectivity tested" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Green
Write-Host "1. If LibreTranslate is working, continue integrating remaining pages" -ForegroundColor White
Write-Host "2. If not working, check network and service availability" -ForegroundColor White
Write-Host "3. Test translation functionality in the running app" -ForegroundColor White

Write-Host "`n🚀 To start the dev server: bun run dev" -ForegroundColor Blue
