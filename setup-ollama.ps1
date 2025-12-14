# Ollama Setup Script for Windows
# Run this in PowerShell to set up Ollama with Gemma 2B

Write-Host "🚀 AutoSolver - Ollama Setup Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Ollama is installed
Write-Host "Checking for Ollama installation..." -ForegroundColor Yellow

try {
    $ollamaVersion = ollama --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ollama is already installed: $ollamaVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Ollama is not installed" -ForegroundColor Red
    Write-Host "`nPlease install Ollama from: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "After installation, run this script again.`n" -ForegroundColor Yellow
    
    # Ask if user wants to open download page
    $response = Read-Host "Would you like to open the download page now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process "https://ollama.com/download/windows"
    }
    exit
}

# Check if Ollama service is running
Write-Host "`nChecking if Ollama service is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Ollama service is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama service is not responding" -ForegroundColor Yellow
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    
    # Try to start Ollama
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Ollama service started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start Ollama service" -ForegroundColor Red
        Write-Host "Please start Ollama manually and try again.`n" -ForegroundColor Yellow
        exit
    }
}

# Check if Gemma 2B model is installed
Write-Host "`nChecking for Gemma 2B model..." -ForegroundColor Yellow

$models = ollama list 2>$null | Out-String
if ($models -match "gemma2:2b") {
    Write-Host "✅ Gemma 2B model is already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Gemma 2B model not found. Installing..." -ForegroundColor Yellow
    Write-Host "This will download approximately 1.6GB. Please wait...`n" -ForegroundColor Cyan
    
    ollama pull gemma2:2b
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Gemma 2B model installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Failed to install Gemma 2B model" -ForegroundColor Red
        exit
    }
}

# Test the model
Write-Host "`nTesting Gemma 2B model..." -ForegroundColor Yellow

$testPrompt = "Say 'Hello! I am Gemma 2B and I am ready to help!' in one sentence."
Write-Host "Sending test prompt..." -ForegroundColor Cyan

try {
    $testResponse = ollama run gemma2:2b $testPrompt 2>$null
    Write-Host "✅ Model test successful!" -ForegroundColor Green
    Write-Host "Response: $testResponse`n" -ForegroundColor White
} catch {
    Write-Host "⚠️  Model test failed, but model is installed" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`nYou can now use Ollama with Gemma 2B in AutoSolver!" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Click the 'Gemma 2B' button in the UI`n" -ForegroundColor White

Write-Host "Available models:" -ForegroundColor Yellow
ollama list

Write-Host "`nFor more information, see OLLAMA_SETUP.md`n" -ForegroundColor Cyan
