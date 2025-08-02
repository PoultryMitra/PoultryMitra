#!/bin/bash

# =============================================================================
# POULTRY MITRA - DEPLOYMENT READINESS CHECK SCRIPT
# =============================================================================
# This script checks all critical functionality before deployment
# Run this script before deploying to ensure everything works correctly
# =============================================================================

echo "🚀 Starting Deployment Readiness Check for Poultry Mitra..."
echo "============================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${BLUE}ℹ️  $details${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        [ -n "$details" ] && echo -e "   ${RED}⚠️  $details${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check HTTP response
check_http_response() {
    local url="$1"
    local expected_status="$2"
    
    if command_exists curl; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        [ "$response" = "$expected_status" ]
    else
        return 1
    fi
}

# =============================================================================
# ENVIRONMENT CHECKS
# =============================================================================
echo -e "${YELLOW}🔧 Environment Checks${NC}"
echo "-------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_test_result "Node.js Installation" "PASS" "Version: $NODE_VERSION"
else
    print_test_result "Node.js Installation" "FAIL" "Node.js not found"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_test_result "npm Installation" "PASS" "Version: $NPM_VERSION"
else
    print_test_result "npm Installation" "FAIL" "npm not found"
fi

# Check if package.json exists
if [ -f "package.json" ]; then
    print_test_result "package.json exists" "PASS" "Found in project root"
else
    print_test_result "package.json exists" "FAIL" "Not found in project root"
fi

# =============================================================================
# DEPENDENCY CHECKS
# =============================================================================
echo -e "${YELLOW}📦 Dependency Checks${NC}"
echo "-------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_test_result "Dependencies installed" "PASS" "node_modules directory exists"
else
    print_test_result "Dependencies installed" "FAIL" "Run 'npm install' first"
fi

# Check for critical dependencies
CRITICAL_DEPS=("react" "firebase" "react-router-dom" "vite" "@radix-ui/react-dialog")
for dep in "${CRITICAL_DEPS[@]}"; do
    if [ -d "node_modules/$dep" ] || npm list "$dep" >/dev/null 2>&1; then
        print_test_result "Dependency: $dep" "PASS" "Installed"
    else
        print_test_result "Dependency: $dep" "FAIL" "Missing critical dependency"
    fi
done

# =============================================================================
# BUILD CHECKS
# =============================================================================
echo -e "${YELLOW}🏗️  Build Checks${NC}"
echo "---------------"

# Try to build the project
echo "Building project..."
if npm run build >/dev/null 2>&1; then
    print_test_result "Project Build" "PASS" "Build completed successfully"
    
    # Check if dist folder was created
    if [ -d "dist" ]; then
        print_test_result "Build Output" "PASS" "dist/ directory created"
        
        # Check critical build files
        BUILD_FILES=("index.html" "assets")
        for file in "${BUILD_FILES[@]}"; do
            if [ -e "dist/$file" ]; then
                print_test_result "Build file: $file" "PASS" "Present in dist/"
            else
                print_test_result "Build file: $file" "FAIL" "Missing from dist/"
            fi
        done
    else
        print_test_result "Build Output" "FAIL" "dist/ directory not created"
    fi
else
    print_test_result "Project Build" "FAIL" "Build failed - check for errors"
fi

# =============================================================================
# CONFIGURATION CHECKS
# =============================================================================
echo -e "${YELLOW}⚙️  Configuration Checks${NC}"
echo "----------------------"

# Check Firebase configuration
if [ -f "src/lib/firebase.ts" ]; then
    print_test_result "Firebase Config" "PASS" "firebase.ts found"
    
    # Check for Firebase keys (without exposing them)
    if grep -q "apiKey" src/lib/firebase.ts && grep -q "projectId" src/lib/firebase.ts; then
        print_test_result "Firebase Keys" "PASS" "API keys configured"
    else
        print_test_result "Firebase Keys" "FAIL" "Missing Firebase configuration"
    fi
else
    print_test_result "Firebase Config" "FAIL" "firebase.ts not found"
fi

# Check environment variables
ENV_FILES=(".env" ".env.local" ".env.production")
env_found=false
for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        print_test_result "Environment File" "PASS" "$env_file found"
        env_found=true
        break
    fi
done

if [ "$env_found" = false ]; then
    print_test_result "Environment File" "FAIL" "No .env file found"
fi

# =============================================================================
# ROUTE CHECKS
# =============================================================================
echo -e "${YELLOW}🛣️  Route Configuration Checks${NC}"
echo "-----------------------------"

# Check App.tsx for critical routes
if [ -f "src/App.tsx" ]; then
    CRITICAL_ROUTES=('path="/"' 'path="/login"' 'path="/register"' 'path="/farmer"' 'path="/dealer"' 'path="/admin"')
    
    for route in "${CRITICAL_ROUTES[@]}"; do
        if grep -q "$route" src/App.tsx; then
            route_name=$(echo "$route" | sed 's/path="//g' | sed 's/"//g')
            print_test_result "Route: $route_name" "PASS" "Configured in App.tsx"
        else
            route_name=$(echo "$route" | sed 's/path="//g' | sed 's/"//g')
            print_test_result "Route: $route_name" "FAIL" "Missing from App.tsx"
        fi
    done
else
    print_test_result "App.tsx" "FAIL" "Main app file not found"
fi

# =============================================================================
# COMPONENT CHECKS
# =============================================================================
echo -e "${YELLOW}🧩 Component Checks${NC}"
echo "------------------"

# Check for critical components
CRITICAL_COMPONENTS=(
    "src/contexts/AuthContext.tsx"
    "src/components/ProfileGuard.tsx" 
    "src/pages/RegisterNew.tsx"
    "src/pages/ProfileCompletion.tsx"
    "src/services/notificationService.ts"
    "src/components/NotificationDemo.tsx"
    "src/pages/ClientRequirementsDemo.tsx"
)

for component in "${CRITICAL_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        print_test_result "Component: $(basename "$component")" "PASS" "File exists"
    else
        print_test_result "Component: $(basename "$component")" "FAIL" "File missing"
    fi
done

# =============================================================================
# FEATURE CHECKS
# =============================================================================
echo -e "${YELLOW}✨ Feature Implementation Checks${NC}"
echo "--------------------------------"

# Check AuthContext for new features
if [ -f "src/contexts/AuthContext.tsx" ]; then
    if grep -q "checkEmailExists" src/contexts/AuthContext.tsx; then
        print_test_result "Email Validation Feature" "PASS" "checkEmailExists function found"
    else
        print_test_result "Email Validation Feature" "FAIL" "checkEmailExists function missing"
    fi
    
    if grep -q "addPasswordToGoogleAccount" src/contexts/AuthContext.tsx; then
        print_test_result "Google Password Setup" "PASS" "addPasswordToGoogleAccount function found"
    else
        print_test_result "Google Password Setup" "FAIL" "addPasswordToGoogleAccount function missing"
    fi
    
    if grep -q "userSession" src/contexts/AuthContext.tsx; then
        print_test_result "Session Persistence" "PASS" "Session storage implemented"
    else
        print_test_result "Session Persistence" "FAIL" "Session storage not implemented"
    fi
fi

# Check notification service
if [ -f "src/services/notificationService.ts" ]; then
    if grep -q "sendTransactionNotification" src/services/notificationService.ts; then
        print_test_result "SMS/WhatsApp Feature" "PASS" "Transaction notification function found"
    else
        print_test_result "SMS/WhatsApp Feature" "FAIL" "Transaction notification missing"
    fi
fi

# Check registration form updates
if [ -f "src/pages/RegisterNew.tsx" ]; then
    if grep -q "flockSize" src/pages/RegisterNew.tsx && grep -q "farmCapacity" src/pages/RegisterNew.tsx; then
        print_test_result "Farmer Fields Update" "PASS" "flockSize and farmCapacity fields found"
    else
        print_test_result "Farmer Fields Update" "FAIL" "Farmer field updates missing"
    fi
fi

# =============================================================================
# SECURITY CHECKS
# =============================================================================
echo -e "${YELLOW}🔒 Security Checks${NC}"
echo "-----------------"

# Check for sensitive data exposure
SENSITIVE_PATTERNS=("password.*=" "secret.*=" "private.*key")
security_issues=0

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r -i "$pattern" src/ 2>/dev/null | grep -v "placeholder\|example\|demo" >/dev/null; then
        security_issues=$((security_issues + 1))
    fi
done

if [ $security_issues -eq 0 ]; then
    print_test_result "Sensitive Data Exposure" "PASS" "No hardcoded secrets found"
else
    print_test_result "Sensitive Data Exposure" "FAIL" "Potential sensitive data found"
fi

# Check ProfileGuard implementation
if [ -f "src/components/ProfileGuard.tsx" ]; then
    if grep -q "adminEmails" src/components/ProfileGuard.tsx && grep -q "role.*admin" src/components/ProfileGuard.tsx; then
        print_test_result "Route Protection" "PASS" "Admin route protection implemented"
    else
        print_test_result "Route Protection" "FAIL" "Route protection incomplete"
    fi
fi

# =============================================================================
# DEPLOYMENT FILES
# =============================================================================
echo -e "${YELLOW}🚀 Deployment File Checks${NC}"
echo "-------------------------"

# Common deployment files
DEPLOYMENT_FILES=("render.yaml" "vercel.json" "netlify.toml" "_redirects")
deployment_file_found=false

for file in "${DEPLOYMENT_FILES[@]}"; do
    if [ -f "$file" ] || [ -f "public/$file" ]; then
        print_test_result "Deployment Config: $file" "PASS" "Found"
        deployment_file_found=true
    fi
done

if [ "$deployment_file_found" = false ]; then
    print_test_result "Deployment Configuration" "FAIL" "No deployment config found"
fi

# Check public folder
if [ -d "public" ]; then
    print_test_result "Public Assets" "PASS" "public/ directory exists"
    
    # Check for essential public files
    PUBLIC_FILES=("index.html" "robots.txt")
    for file in "${PUBLIC_FILES[@]}"; do
        if [ -f "public/$file" ]; then
            print_test_result "Public file: $file" "PASS" "Present"
        fi
    done
else
    print_test_result "Public Assets" "FAIL" "public/ directory missing"
fi

# =============================================================================
# FINAL SUMMARY
# =============================================================================
echo
echo "============================================================="
echo -e "${BLUE}📊 DEPLOYMENT READINESS SUMMARY${NC}"
echo "============================================================="
echo
echo -e "Total Tests Run: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Tests Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests Failed: ${RED}$FAILED_TESTS${NC}"
echo

# Calculate success percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo -e "Success Rate: ${YELLOW}$SUCCESS_RATE%${NC}"
    echo
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 DEPLOYMENT READY!${NC}"
        echo -e "${GREEN}Your application is ready for deployment.${NC}"
        echo
        echo -e "${BLUE}Next Steps:${NC}"
        echo "1. Commit your changes to git"
        echo "2. Push to your repository"
        echo "3. Deploy to your hosting platform"
        echo "4. Test the deployed application"
    elif [ $SUCCESS_RATE -ge 70 ]; then
        echo -e "${YELLOW}⚠️  MOSTLY READY${NC}"
        echo -e "${YELLOW}Your application is mostly ready but has some issues.${NC}"
        echo -e "${YELLOW}Please fix the failed tests before deploying.${NC}"
    else
        echo -e "${RED}🚫 NOT READY FOR DEPLOYMENT${NC}"
        echo -e "${RED}Your application has significant issues.${NC}"
        echo -e "${RED}Please fix the failed tests before deploying.${NC}"
    fi
else
    echo -e "${RED}No tests were run!${NC}"
fi

echo
echo "============================================================="
echo -e "${BLUE}📋 QUICK DEPLOYMENT COMMANDS${NC}"
echo "============================================================="
echo
echo "For Render.com:"
echo "  git add ."
echo "  git commit -m 'Deploy: All features implemented and tested'"
echo "  git push origin main"
echo
echo "For Vercel:"
echo "  npm install -g vercel"
echo "  vercel --prod"
echo
echo "For Netlify:"
echo "  npm run build"
echo "  # Drag and drop 'dist' folder to Netlify"
echo
echo "============================================================="

# Exit with appropriate code
if [ $SUCCESS_RATE -ge 90 ]; then
    exit 0
else
    exit 1
fi
