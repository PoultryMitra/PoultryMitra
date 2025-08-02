# =============================================================================
# POULTRY MITRA - DEPLOYMENT READINESS CHECK SCRIPT (PowerShell Version)
# =============================================================================
# This script checks all critical functionality before deployment
# Run this script before deploying to ensure everything works correctly
# Usage: .\deployment-check.ps1
# =============================================================================

Write-Host "🚀 Starting Deployment Readiness Check for Poultry Mitra..." -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Test results tracking
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

# Function to print test results
function Print-TestResult {
    param(
        [string]$TestName,
        [string]$Result,
        [string]$Details = ""
    )
    
    $script:TotalTests++
    
    if ($Result -eq "PASS") {
        Write-Host "✅ PASS - $TestName" -ForegroundColor Green
        if ($Details) { 
            Write-Host "   ℹ️  $Details" -ForegroundColor Blue 
        }
        $script:PassedTests++
    } else {
        Write-Host "❌ FAIL - $TestName" -ForegroundColor Red
        if ($Details) { 
            Write-Host "   ⚠️  $Details" -ForegroundColor Red 
        }
        $script:FailedTests++
    }
    Write-Host ""
}

# Function to check if command exists
function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# =============================================================================
# ENVIRONMENT CHECKS
# =============================================================================
Write-Host "🔧 Environment Checks" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

# Check Node.js
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Print-TestResult "Node.js Installation" "PASS" "Version: $nodeVersion"
} else {
    Print-TestResult "Node.js Installation" "FAIL" "Node.js not found"
}

# Check npm
if (Test-CommandExists "npm") {
    $npmVersion = npm --version
    Print-TestResult "npm Installation" "PASS" "Version: $npmVersion"
} else {
    Print-TestResult "npm Installation" "FAIL" "npm not found"
}

# Check if package.json exists
if (Test-Path "package.json") {
    Print-TestResult "package.json exists" "PASS" "Found in project root"
} else {
    Print-TestResult "package.json exists" "FAIL" "Not found in project root"
}

# =============================================================================
# DEPENDENCY CHECKS
# =============================================================================
Write-Host "📦 Dependency Checks" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

# Check if node_modules exists
if (Test-Path "node_modules") {
    Print-TestResult "Dependencies installed" "PASS" "node_modules directory exists"
} else {
    Print-TestResult "Dependencies installed" "FAIL" "Run 'npm install' first"
}

# Check for critical dependencies
$criticalDeps = @("react", "firebase", "react-router-dom", "vite", "@radix-ui/react-dialog")
foreach ($dep in $criticalDeps) {
    $depPath = "node_modules/$dep"
    if (Test-Path $depPath) {
        Print-TestResult "Dependency: $dep" "PASS" "Installed"
    } else {
        Print-TestResult "Dependency: $dep" "FAIL" "Missing critical dependency"
    }
}

# =============================================================================
# BUILD CHECKS
# =============================================================================
Write-Host "🏗️  Build Checks" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow

# Try to build the project
Write-Host "Building project..." -ForegroundColor Gray
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Print-TestResult "Project Build" "PASS" "Build completed successfully"
        
        # Check if dist folder was created
        if (Test-Path "dist") {
            Print-TestResult "Build Output" "PASS" "dist/ directory created"
            
            # Check critical build files
            $buildFiles = @("index.html", "assets")
            foreach ($file in $buildFiles) {
                $filePath = "dist/$file"
                if (Test-Path $filePath) {
                    Print-TestResult "Build file: $file" "PASS" "Present in dist/"
                } else {
                    Print-TestResult "Build file: $file" "FAIL" "Missing from dist/"
                }
            }
        } else {
            Print-TestResult "Build Output" "FAIL" "dist/ directory not created"
        }
    } else {
        Print-TestResult "Project Build" "FAIL" "Build failed - check for errors"
    }
} catch {
    Print-TestResult "Project Build" "FAIL" "Build failed with exception"
}

# =============================================================================
# CONFIGURATION CHECKS
# =============================================================================
Write-Host "⚙️  Configuration Checks" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

# Check Firebase configuration
if (Test-Path "src/lib/firebase.ts") {
    Print-TestResult "Firebase Config" "PASS" "firebase.ts found"
    
    # Check for Firebase keys (without exposing them)
    $firebaseContent = Get-Content "src/lib/firebase.ts" -Raw
    if ($firebaseContent -match "apiKey" -and $firebaseContent -match "projectId") {
        Print-TestResult "Firebase Keys" "PASS" "API keys configured"
    } else {
        Print-TestResult "Firebase Keys" "FAIL" "Missing Firebase configuration"
    }
} else {
    Print-TestResult "Firebase Config" "FAIL" "firebase.ts not found"
}

# Check environment variables
$envFiles = @(".env", ".env.local", ".env.production")
$envFound = $false
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Print-TestResult "Environment File" "PASS" "$envFile found"
        $envFound = $true
        break
    }
}

if (-not $envFound) {
    Print-TestResult "Environment File" "FAIL" "No .env file found"
}

# =============================================================================
# ROUTE CHECKS
# =============================================================================
Write-Host "🛣️  Route Configuration Checks" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

# Check App.tsx for critical routes
if (Test-Path "src/App.tsx") {
    $appContent = Get-Content "src/App.tsx" -Raw
    $criticalRoutes = @('path="/"', 'path="/login"', 'path="/register"', 'path="/farmer"', 'path="/dealer"', 'path="/admin"')
    
    foreach ($route in $criticalRoutes) {
        if ($appContent -match [regex]::Escape($route)) {
            $routeName = $route -replace 'path="', '' -replace '"', ''
            Print-TestResult "Route: $routeName" "PASS" "Configured in App.tsx"
        } else {
            $routeName = $route -replace 'path="', '' -replace '"', ''
            Print-TestResult "Route: $routeName" "FAIL" "Missing from App.tsx"
        }
    }
} else {
    Print-TestResult "App.tsx" "FAIL" "Main app file not found"
}

# =============================================================================
# COMPONENT CHECKS
# =============================================================================
Write-Host "🧩 Component Checks" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow

# Check for critical components
$criticalComponents = @(
    "src/contexts/AuthContext.tsx",
    "src/components/ProfileGuard.tsx", 
    "src/pages/RegisterNew.tsx",
    "src/pages/ProfileCompletion.tsx",
    "src/services/notificationService.ts",
    "src/components/NotificationDemo.tsx",
    "src/pages/ClientRequirementsDemo.tsx"
)

foreach ($component in $criticalComponents) {
    if (Test-Path $component) {
        $componentName = Split-Path $component -Leaf
        Print-TestResult "Component: $componentName" "PASS" "File exists"
    } else {
        $componentName = Split-Path $component -Leaf
        Print-TestResult "Component: $componentName" "FAIL" "File missing"
    }
}

# =============================================================================
# FEATURE CHECKS
# =============================================================================
Write-Host "✨ Feature Implementation Checks" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

# Check AuthContext for new features
if (Test-Path "src/contexts/AuthContext.tsx") {
    $authContent = Get-Content "src/contexts/AuthContext.tsx" -Raw
    
    if ($authContent -match "checkEmailExists") {
        Print-TestResult "Email Validation Feature" "PASS" "checkEmailExists function found"
    } else {
        Print-TestResult "Email Validation Feature" "FAIL" "checkEmailExists function missing"
    }
    
    if ($authContent -match "addPasswordToGoogleAccount") {
        Print-TestResult "Google Password Setup" "PASS" "addPasswordToGoogleAccount function found"
    } else {
        Print-TestResult "Google Password Setup" "FAIL" "addPasswordToGoogleAccount function missing"
    }
    
    if ($authContent -match "userSession") {
        Print-TestResult "Session Persistence" "PASS" "Session storage implemented"
    } else {
        Print-TestResult "Session Persistence" "FAIL" "Session storage not implemented"
    }
}

# Check notification service
if (Test-Path "src/services/notificationService.ts") {
    $notificationContent = Get-Content "src/services/notificationService.ts" -Raw
    if ($notificationContent -match "sendTransactionNotification") {
        Print-TestResult "SMS/WhatsApp Feature" "PASS" "Transaction notification function found"
    } else {
        Print-TestResult "SMS/WhatsApp Feature" "FAIL" "Transaction notification missing"
    }
}

# Check registration form updates
if (Test-Path "src/pages/RegisterNew.tsx") {
    $registerContent = Get-Content "src/pages/RegisterNew.tsx" -Raw
    if ($registerContent -match "flockSize" -and $registerContent -match "farmCapacity") {
        Print-TestResult "Farmer Fields Update" "PASS" "flockSize and farmCapacity fields found"
    } else {
        Print-TestResult "Farmer Fields Update" "FAIL" "Farmer field updates missing"
    }
}

# =============================================================================
# SECURITY CHECKS
# =============================================================================
Write-Host "🔒 Security Checks" -ForegroundColor Yellow
Write-Host "-----------------" -ForegroundColor Yellow

# Check ProfileGuard implementation
if (Test-Path "src/components/ProfileGuard.tsx") {
    $guardContent = Get-Content "src/components/ProfileGuard.tsx" -Raw
    if ($guardContent -match "adminEmails" -and $guardContent -match "role.*admin") {
        Print-TestResult "Route Protection" "PASS" "Admin route protection implemented"
    } else {
        Print-TestResult "Route Protection" "FAIL" "Route protection incomplete"
    }
}

# =============================================================================
# DEPLOYMENT FILES
# =============================================================================
Write-Host "🚀 Deployment File Checks" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

# Common deployment files
$deploymentFiles = @("render.yaml", "vercel.json", "netlify.toml", "_redirects")
$deploymentFileFound = $false

foreach ($file in $deploymentFiles) {
    if ((Test-Path $file) -or (Test-Path "public/$file")) {
        Print-TestResult "Deployment Config: $file" "PASS" "Found"
        $deploymentFileFound = $true
    }
}

if (-not $deploymentFileFound) {
    Print-TestResult "Deployment Configuration" "FAIL" "No deployment config found"
}

# Check public folder
if (Test-Path "public") {
    Print-TestResult "Public Assets" "PASS" "public/ directory exists"
    
    # Check for essential public files
    $publicFiles = @("robots.txt")
    foreach ($file in $publicFiles) {
        if (Test-Path "public/$file") {
            Print-TestResult "Public file: $file" "PASS" "Present"
        }
    }
} else {
    Print-TestResult "Public Assets" "FAIL" "public/ directory missing"
}

# =============================================================================
# FINAL SUMMARY
# =============================================================================
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "📊 DEPLOYMENT READINESS SUMMARY" -ForegroundColor Blue
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests Run: $TotalTests" -ForegroundColor Yellow
Write-Host "Tests Passed: $PassedTests" -ForegroundColor Green
Write-Host "Tests Failed: $FailedTests" -ForegroundColor Red
Write-Host ""

# Calculate success percentage
if ($TotalTests -gt 0) {
    $successRate = [math]::Round(($PassedTests * 100) / $TotalTests)
    Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
    Write-Host ""
    
    if ($successRate -ge 90) {
        Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green
        Write-Host "Your application is ready for deployment." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Blue
        Write-Host "1. Commit your changes to git"
        Write-Host "2. Push to your repository"
        Write-Host "3. Deploy to your hosting platform"
        Write-Host "4. Test the deployed application"
    } elseif ($successRate -ge 70) {
        Write-Host "⚠️  MOSTLY READY" -ForegroundColor Yellow
        Write-Host "Your application is mostly ready but has some issues." -ForegroundColor Yellow
        Write-Host "Please fix the failed tests before deploying." -ForegroundColor Yellow
    } else {
        Write-Host "🚫 NOT READY FOR DEPLOYMENT" -ForegroundColor Red
        Write-Host "Your application has significant issues." -ForegroundColor Red
        Write-Host "Please fix the failed tests before deploying." -ForegroundColor Red
    }
} else {
    Write-Host "No tests were run!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "📋 QUICK DEPLOYMENT COMMANDS" -ForegroundColor Blue
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "For Render.com:"
Write-Host "  git add ."
Write-Host "  git commit -m 'Deploy: All features implemented and tested'"
Write-Host "  git push origin main"
Write-Host ""

Write-Host "For Vercel:"
Write-Host "  npm install -g vercel"
Write-Host "  vercel --prod"
Write-Host ""

Write-Host "For Netlify:"
Write-Host "  npm run build"
Write-Host "  # Drag and drop 'dist' folder to Netlify"
Write-Host ""

Write-Host "=============================================================" -ForegroundColor Cyan

# Exit with appropriate code
if ($successRate -ge 90) {
    exit 0
} else {
    exit 1
}
