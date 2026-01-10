# Create GitHub Actions workflow

# Create .github/workflows directory
$workflowDir = ".github\workflows"
if (!(Test-Path $workflowDir)) {
    New-Item -ItemType Directory -Path $workflowDir -Force
    Write-Host "Created directory $workflowDir" -ForegroundColor Green
}

# Deploy.yml content
$deployYml = @"
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_API_URL: https://water-meter-github.onrender.com/api
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: `$`${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
"@

# Create deploy.yml file
$deployFile = "$workflowDir\deploy.yml"
$deployYml | Out-File -FilePath $deployFile -Encoding UTF8
Write-Host "Created file $deployFile" -ForegroundColor Green

# Add to git and commit
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push

Write-Host "GitHub Actions workflow created and pushed!" -ForegroundColor Green