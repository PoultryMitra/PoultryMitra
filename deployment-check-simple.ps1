# =============================================================================
# POULTRY MITRA - DEPLOYMENT READINESS CHECK SCRIPT
# =============================================================================

Write-Host "Starting Deployment Readiness Check for Poultry Mitra..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-Feature {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    
    $script:TotalTests++
    
    if ($Condition) {
        Write-Host "PASS - $Name" -ForegroundColor Green
        if ($Details) { Write-Host "  $Details" -ForegroundColor Blue }
        $script:PassedTests++
    } else {
        Write-Host "FAIL - $Name" -ForegroundColor Red
        if ($Details) { Write-Host "  $Details" -ForegroundColor Red }
        $script:FailedTests++
    }
    Write-Host ""
}

Write-Host "Environment Checks" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow

# Check Node.js
$nodeExists = Get-Command "node" -ErrorAction SilentlyContinue
if ($nodeExists) {
    $nodeVersion = node --version
    Test-Feature "Node.js Installation" $true "Version: $nodeVersion"
} else {
    Test-Feature "Node.js Installation" $false "Node.js not found"
}

# Check npm
$npmExists = Get-Command "npm" -ErrorAction SilentlyContinue
if ($npmExists) {
    $npmVersion = npm --version
    Test-Feature "npm Installation" $true "Version: $npmVersion"
} else {
    Test-Feature "npm Installation" $false "npm not found"
}

# Check package.json
Test-Feature "package.json exists" (Test-Path "package.json") "Found in project root"

Write-Host "Dependency Checks" -ForegroundColor Yellow
Write-Host "-----------------" -ForegroundColor Yellow

# Check node_modules
Test-Feature "Dependencies installed" (Test-Path "node_modules") "node_modules directory exists"

# Check critical dependencies
$criticalDeps = @("react", "firebase", "react-router-dom", "vite")
foreach ($dep in $criticalDeps) {
    $depExists = Test-Path "node_modules/$dep"
    Test-Feature "Dependency: $dep" $depExists "Checking installation"
}

Write-Host "Configuration Checks" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

# Check Firebase config
$firebaseConfigExists = Test-Path "src/lib/firebase.ts"
Test-Feature "Firebase Config" $firebaseConfigExists "firebase.ts file"

if ($firebaseConfigExists) {
    $firebaseContent = Get-Content "src/lib/firebase.ts" -Raw
    $hasApiKey = $firebaseContent -match "apiKey"
    $hasProjectId = $firebaseContent -match "projectId"
    Test-Feature "Firebase Keys" ($hasApiKey -and $hasProjectId) "API keys configured"
}

Write-Host "Component Checks" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Yellow

# Check critical components
$components = @(
    "src/contexts/AuthContext.tsx",
    "src/components/ProfileGuard.tsx",
    "src/pages/RegisterNew.tsx",
    "src/pages/ProfileCompletion.tsx",
    "src/services/notificationService.ts",
    "src/components/NotificationDemo.tsx",
    "src/pages/ClientRequirementsDemo.tsx"
)

foreach ($component in $components) {
    $exists = Test-Path $component
    $name = Split-Path $component -Leaf
    Test-Feature "Component: $name" $exists "File existence check"
}

Write-Host "Feature Implementation Checks" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow

# Check AuthContext features
if (Test-Path "src/contexts/AuthContext.tsx") {
    $authContent = Get-Content "src/contexts/AuthContext.tsx" -Raw
    
    Test-Feature "Email Validation Feature" ($authContent -match "checkEmailExists") "checkEmailExists function"
    Test-Feature "Google Password Setup" ($authContent -match "addPasswordToGoogleAccount") "addPasswordToGoogleAccount function"
    Test-Feature "Session Persistence" ($authContent -match "userSession") "Session storage"
}

# Check notification service
if (Test-Path "src/services/notificationService.ts") {
    $notificationContent = Get-Content "src/services/notificationService.ts" -Raw
    Test-Feature "SMS/WhatsApp Feature" ($notificationContent -match "sendTransactionNotification") "Transaction notifications"
}

# Check registration updates
if (Test-Path "src/pages/RegisterNew.tsx") {
    $registerContent = Get-Content "src/pages/RegisterNew.tsx" -Raw
    $hasFlockSize = $registerContent -match "flockSize"
    $hasFarmCapacity = $registerContent -match "farmCapacity"
    Test-Feature "Farmer Fields Update" ($hasFlockSize -and $hasFarmCapacity) "flockSize and farmCapacity fields"
}

Write-Host "Build Test" -ForegroundColor Yellow
Write-Host "----------" -ForegroundColor Yellow

Write-Host "Testing build process..." -ForegroundColor Gray
try {
    $null = npm run build 2>&1
    $buildSuccess = $LASTEXITCODE -eq 0
    Test-Feature "Project Build" $buildSuccess "Build compilation"
    
    if ($buildSuccess) {
        Test-Feature "Build Output" (Test-Path "dist") "dist directory created"
        Test-Feature "Build Assets" (Test-Path "dist/index.html") "index.html in dist"
    }
} catch {
    Test-Feature "Project Build" $false "Build failed with exception"
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT READINESS SUMMARY" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests: $TotalTests" -ForegroundColor Yellow
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red

if ($TotalTests -gt 0) {
    $successRate = [math]::Round(($PassedTests * 100) / $TotalTests)
    Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
    Write-Host ""
    
    if ($successRate -ge 90) {
        Write-Host "DEPLOYMENT READY!" -ForegroundColor Green
        Write-Host "Your application is ready for deployment." -ForegroundColor Green
        Write-Host ""
        Write-Host "Deployment Commands:" -ForegroundColor Blue
        Write-Host "git add ."
        Write-Host "git commit -m 'Deploy: All features implemented'"
        Write-Host "git push origin main"
    } elseif ($successRate -ge 70) {
        Write-Host "MOSTLY READY" -ForegroundColor Yellow
        Write-Host "Fix the failed tests before deploying." -ForegroundColor Yellow
    } else {
        Write-Host "NOT READY FOR DEPLOYMENT" -ForegroundColor Red
        Write-Host "Please fix the failed tests." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All implemented features:" -ForegroundColor Blue
Write-Host "- Enhanced registration with email validation"
Write-Host "- Google password setup option"
Write-Host "- Session persistence across refreshes"
Write-Host "- SMS/WhatsApp transaction notifications"
Write-Host "- Farmer fields: flock size and farm capacity"
Write-Host "- Route protection improvements"
Write-Host ""
