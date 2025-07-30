#!/bin/bash

# Build Script for Poultry Mitra - Client Delivery Package
# This script prepares the complete package for client delivery

echo "🐔 Preparing Poultry Mitra Client Delivery Package..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

echo -e "${BLUE}📋 Step 2: Running build process...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo -e "${BLUE}📋 Step 3: Creating package structure...${NC}"

# Create package directory
PACKAGE_DIR="poultry-mitra-delivery-package"
rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

# Copy source code
echo -e "${YELLOW}📁 Copying source code...${NC}"
cp -r src $PACKAGE_DIR/
cp -r public $PACKAGE_DIR/
cp -r dist $PACKAGE_DIR/

# Copy configuration files
echo -e "${YELLOW}📁 Copying configuration files...${NC}"
cp package.json $PACKAGE_DIR/
cp package-lock.json $PACKAGE_DIR/
cp vite.config.ts $PACKAGE_DIR/
cp tsconfig.json $PACKAGE_DIR/
cp tsconfig.app.json $PACKAGE_DIR/
cp tsconfig.node.json $PACKAGE_DIR/
cp tailwind.config.ts $PACKAGE_DIR/
cp postcss.config.js $PACKAGE_DIR/
cp components.json $PACKAGE_DIR/
cp eslint.config.js $PACKAGE_DIR/
cp index.html $PACKAGE_DIR/

# Copy environment template
cp .env.template $PACKAGE_DIR/

# Copy documentation
echo -e "${YELLOW}📁 Copying documentation...${NC}"
cp README.md $PACKAGE_DIR/
cp DEPLOYMENT.md $PACKAGE_DIR/
cp PROJECT_COMPLETION_SUMMARY.md $PACKAGE_DIR/
cp CLIENT_DELIVERY_PACKAGE.md $PACKAGE_DIR/

# Create additional documentation
echo -e "${YELLOW}📁 Creating additional documentation...${NC}"

# Create installation script for Windows
cat > $PACKAGE_DIR/install.bat << 'EOF'
@echo off
echo Installing Poultry Mitra...
echo ==========================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed successfully!
echo.
echo To start the development server, run:
echo npm run dev
echo.
pause
EOF

# Create installation script for Unix/Linux/Mac
cat > $PACKAGE_DIR/install.sh << 'EOF'
#!/bin/bash

echo "Installing Poultry Mitra..."
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please download and install Node.js from https://nodejs.org"
    exit 1
fi

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "To start the development server, run:"
echo "npm run dev"
echo ""
EOF

chmod +x $PACKAGE_DIR/install.sh

# Create quick start guide
cat > $PACKAGE_DIR/QUICK_START.md << 'EOF'
# 🚀 Quick Start Guide

## For Windows Users:
1. Double-click `install.bat`
2. Wait for installation to complete
3. Open command prompt in this folder
4. Run: `npm run dev`
5. Open browser to `http://localhost:8080`

## For Mac/Linux Users:
1. Open terminal in this folder
2. Run: `./install.sh`
3. Run: `npm run dev`
4. Open browser to `http://localhost:8080`

## Manual Installation:
1. Install Node.js from https://nodejs.org
2. Open terminal/command prompt in this folder
3. Run: `npm install`
4. Run: `npm run dev`
5. Open browser to `http://localhost:8080`

## Environment Setup:
1. Copy `.env.template` to `.env`
2. Fill in your Firebase configuration
3. Save the file
4. Restart the development server

For detailed instructions, see README.md
EOF

# Create user manual
cat > $PACKAGE_DIR/USER_MANUAL.md << 'EOF'
# 📖 User Manual - Poultry Mitra

## Getting Started

### 1. Account Registration
- Visit the website homepage
- Click "Sign Up" button
- Enter your email, password, and personal details
- Select your role: Farmer, Dealer, or Admin
- Complete profile information
- Verify your email (if required)

### 2. Dashboard Overview

#### Farmer Dashboard
- **Farm Overview**: See your farm statistics
- **FCR Calculator**: Calculate feed conversion ratios
- **Expenses**: Track your farm expenses
- **Market Rates**: View current market prices
- **Reports**: Generate financial reports

#### Dealer Dashboard
- **Customer Management**: Manage farmer accounts
- **Order Tracking**: Track orders and deliveries
- **Market Analysis**: Compare rates and trends
- **Business Reports**: View business analytics

#### Admin Panel
- **User Management**: Add, edit, delete users
- **Rate Management**: Update market rates
- **System Analytics**: View system usage
- **Content Management**: Manage system content

### 3. Key Features

#### FCR Calculator
1. Navigate to FCR Calculator page
2. Enter number of chicks placed
3. Enter total feed consumed (kg)
4. Enter number of birds sold
5. Enter average weight (kg)
6. Enter mortality count
7. Click "Calculate FCR"
8. View results and analysis charts

#### Market Rates
1. Go to Rates page
2. View current prices for:
   - Broiler chicken
   - Eggs
   - Feed
   - Other poultry products
3. Compare historical trends
4. Export rate data

#### Expense Tracking
1. Navigate to Expenses page
2. Click "Add Expense"
3. Select category (Feed, Medicine, Labor, etc.)
4. Enter amount and description
5. Set date
6. Save expense
7. View monthly/yearly summaries

### 4. Reports and Analytics
- View interactive charts
- Export data to PDF/Excel
- Generate custom date range reports
- Compare performance metrics

### 5. Profile Management
- Update personal information
- Change password
- Manage notification preferences
- Upload profile picture

### 6. Support
- Use in-app help tooltips
- Contact support through contact form
- Check FAQ section
- Email: support@poultrymitra.com

## Tips for Best Experience
- Use latest version of Chrome, Firefox, or Safari
- Ensure stable internet connection
- Regularly backup your data
- Keep your browser updated
- Use strong passwords for security
EOF

echo -e "${GREEN}✅ Package structure created${NC}"

echo -e "${BLUE}📋 Step 4: Creating compressed package...${NC}"

# Create ZIP file (if zip command is available)
if command -v zip &> /dev/null; then
    zip -r poultry-mitra-complete-package.zip $PACKAGE_DIR/
    echo -e "${GREEN}✅ ZIP package created: poultry-mitra-complete-package.zip${NC}"
else
    echo -e "${YELLOW}⚠️  ZIP command not available. Package directory created: $PACKAGE_DIR${NC}"
fi

echo -e "${BLUE}📋 Step 5: Package verification...${NC}"

# Check if all files are present
echo -e "${YELLOW}📁 Verifying package contents...${NC}"

REQUIRED_FILES=(
    "src"
    "public"
    "dist"
    "package.json"
    "README.md"
    "DEPLOYMENT.md"
    "CLIENT_DELIVERY_PACKAGE.md"
    "QUICK_START.md"
    "USER_MANUAL.md"
    ".env.template"
    "install.bat"
    "install.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$PACKAGE_DIR/$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Package preparation completed successfully!${NC}"
echo ""
echo -e "${BLUE}📦 Package contents:${NC}"
echo -e "${YELLOW}  - Complete source code${NC}"
echo -e "${YELLOW}  - Production build${NC}"
echo -e "${YELLOW}  - Installation scripts${NC}"
echo -e "${YELLOW}  - Comprehensive documentation${NC}"
echo -e "${YELLOW}  - Deployment guides${NC}"
echo -e "${YELLOW}  - User manual${NC}"
echo ""
echo -e "${BLUE}📂 Package location: $PACKAGE_DIR/${NC}"
if command -v zip &> /dev/null; then
    echo -e "${BLUE}📦 ZIP file: poultry-mitra-complete-package.zip${NC}"
fi
echo ""
echo -e "${GREEN}Ready for client delivery! 🚀${NC}"
