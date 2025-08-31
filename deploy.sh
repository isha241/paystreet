#!/bin/bash

echo "🚀 PayStreet Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them before deploying."
    git status --short
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 1
    fi
fi

# Build frontend
print_status "Building frontend..."
cd frontend
if npm run build; then
    print_status "Frontend build successful!"
else
    print_error "Frontend build failed!"
    exit 1
fi
cd ..

# Run backend tests
print_status "Running backend tests..."
cd backend
if npm test; then
    print_status "Backend tests passed!"
else
    print_warning "Backend tests failed! Continuing with deployment..."
fi
cd ..

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Deploy frontend to Vercel
print_status "Deploying frontend to Vercel..."
cd frontend
if vercel --prod --yes; then
    print_status "Frontend deployed successfully!"
    FRONTEND_URL=$(vercel ls | grep paystreet | head -1 | awk '{print $2}')
    echo "Frontend URL: $FRONTEND_URL"
else
    print_error "Frontend deployment failed!"
    exit 1
fi
cd ..

# Create deployment summary
print_status "Creating deployment summary..."
DEPLOYMENT_SUMMARY="deployment-summary-$(date +%Y%m%d-%H%M%S).txt"

cat > "$DEPLOYMENT_SUMMARY" << EOF
PayStreet Deployment Summary
============================
Date: $(date)
Branch: $CURRENT_BRANCH
Commit: $(git rev-parse --short HEAD)

Frontend:
- Status: Deployed ✅
- URL: $FRONTEND_URL
- Build: Successful

Backend:
- Status: Ready for deployment
- Tests: $(cd backend && npm test > /dev/null 2>&1 && echo "Passed ✅" || echo "Failed ❌")

Next Steps:
1. Deploy backend to Render/Heroku
2. Update frontend environment variables
3. Test the deployed application

Environment Variables for Backend:
- DATABASE_URL: Your PostgreSQL connection string
- JWT_SECRET: Your JWT secret key
- EXCHANGE_RATE_API_URL: https://api.exchangerate.host
- PORT: 10000 (or your platform's default)

Environment Variables for Frontend:
- REACT_APP_API_URL: Your backend deployment URL
EOF

print_status "Deployment summary saved to: $DEPLOYMENT_SUMMARY"

echo ""
echo "🎉 Deployment completed!"
echo "================================"
echo "Frontend: $FRONTEND_URL"
echo "Backend: Ready for platform deployment"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render/Heroku"
echo "2. Update frontend API URL"
echo "3. Test the complete application"
echo ""
echo "For backend deployment:"
echo "- Render: https://render.com"
echo "- Heroku: https://heroku.com"
echo ""
echo "Deployment summary saved to: $DEPLOYMENT_SUMMARY"
