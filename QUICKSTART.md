# 🚀 Quick Start Guide - AutoSolver with Gemma 2B

## What You Just Got

Your AutoSolver project now supports **TWO AI backends**:

1. **Gemini API** (Cloud) - Google's powerful cloud AI
2. **Gemma 2B via Ollama** (Local) - Open-source AI running on your computer

## 📋 What Changed

### New Files Created
- ✅ `services/ollamaService.ts` - Local AI integration
- ✅ `OLLAMA_SETUP.md` - Detailed setup guide
- ✅ `setup-ollama.ps1` - Automated setup script
- ✅ `ARCHITECTURE.md` - System architecture docs
- ✅ `QUICKSTART.md` - This file!

### Modified Files
- ✅ `services/geminiService.ts` - Now supports both providers
- ✅ `App.tsx` - Added model selector UI
- ✅ `README.md` - Updated with Ollama info

## 🎯 Choose Your Path

### Path A: Use Gemini API (Easiest)
**Best for**: Quick testing, highest quality results

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here

# 3. Run the app
npm run dev

# 4. Open http://localhost:3000
# The "Gemini" button will be active by default
```

### Path B: Use Ollama + Gemma 2B (Free & Private)
**Best for**: Privacy, offline use, no API costs

#### Windows
```powershell
# 1. Run the automated setup script
.\setup-ollama.ps1

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev

# 4. Open http://localhost:3000
# Click the "Gemma 2B" button to use local AI
```

#### macOS/Linux
```bash
# 1. Install Ollama
# macOS:
brew install ollama

# Linux:
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull Gemma 2B model
ollama pull gemma2:2b

# 3. Install dependencies
npm install

# 4. Run the app
npm run dev

# 5. Open http://localhost:3000
# Click the "Gemma 2B" button to use local AI
```

## 🎨 Using the New UI

### Model Selector (Top-Right Corner)

You'll see two buttons:

1. **☁️ Gemini** (Indigo/Blue)
   - Uses Google's Gemini API
   - Requires API key
   - Cloud-based processing
   - Fastest and highest quality

2. **🖥️ Gemma 2B** (Green)
   - Uses local Ollama
   - No API key needed
   - Runs on your computer
   - Free and private
   - Shows "(offline)" if Ollama not detected

### How to Switch Models

1. **Before Processing**: Click either button to select your preferred model
2. **During Processing**: Model selection is locked
3. **After Processing**: You can switch and process again with a different model

### System Logs

The terminal panel will show which model is active:
- 🟢 "Ollama detected - Local AI available!"
- 🔵 "Using Gemini API (Ollama not detected)"
- "Switched to Ollama (Gemma 2B - Local)"
- "Switched to Gemini API (Cloud)"

## 📊 Quick Comparison

| Feature | Gemini API | Gemma 2B (Ollama) |
|---------|-----------|-------------------|
| **Setup Time** | 2 minutes | 10 minutes |
| **Cost** | ~$0.075/1M tokens | FREE |
| **Speed** | ⚡⚡⚡ Fast | ⚡⚡ Moderate |
| **Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good |
| **Privacy** | Data → Google | 100% Local |
| **Internet** | Required | Not Required |
| **Best For** | Production, Quality | Privacy, Learning |

## 🧪 Test It Out

### Sample Workflow

1. **Prepare Test Files**:
   - Create `questions.txt` with some questions
   - Create `notes.txt` with source material

2. **Upload Files**:
   - Click "Question Bank" upload area
   - Select your questions file
   - Click "Source Notes" upload area
   - Select your notes file

3. **Choose Model**:
   - Click "Gemini" for cloud processing
   - OR click "Gemma 2B" for local processing

4. **Process**:
   - Click "Start Processing"
   - Watch the live preview
   - See agent logs in the terminal

5. **Download**:
   - Click "Download Solved Doc"
   - Get your filled DOCX file

## 🔧 Troubleshooting

### "Gemma 2B (offline)" Button Disabled

**Problem**: Ollama is not detected

**Solutions**:
```bash
# Check if Ollama is installed
ollama --version

# Check if Ollama is running
ollama list

# Start Ollama (if needed)
ollama serve

# Pull Gemma 2B model
ollama pull gemma2:2b
```

### TypeScript Errors in IDE

**Problem**: Red squiggly lines in code

**Solution**: These will disappear after running:
```bash
npm install
```

### Port 11434 Already in Use

**Problem**: Ollama can't start

**Solution**:
```bash
# Windows
netstat -ano | findstr :11434
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :11434
kill -9 <PID>
```

### Model Too Slow

**Problem**: Gemma 2B is taking too long

**Solutions**:
1. Switch to Gemini API (faster)
2. Use smaller documents
3. Close other applications
4. Upgrade your hardware

## 📚 Learn More

- **Detailed Setup**: See [OLLAMA_SETUP.md](OLLAMA_SETUP.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Main README**: See [README.md](README.md)

## 🎓 Understanding the Code

### Key Files

```typescript
// services/ollamaService.ts
// - Handles local AI via Ollama
// - Connects to http://localhost:11434
// - No API key required

// services/geminiService.ts
// - Handles both Gemini and Ollama
// - Routes to correct provider
// - Exports: analyzeQuestions, solveQuestion

// App.tsx
// - Main UI component
// - Model selector buttons
// - State management
```

### How It Works

```
1. User selects model (Gemini or Gemma 2B)
2. App calls setModelProvider('gemini' | 'ollama')
3. When processing starts:
   - analyzeQuestions() checks currentProvider
   - Routes to Gemini API OR Ollama
4. Results displayed in real-time
5. Download compiled document
```

## 🚀 Next Steps

### Recommended Learning Path

1. **Day 1**: Try Gemini API (easiest)
2. **Day 2**: Install Ollama and try Gemma 2B
3. **Day 3**: Compare results between both models
4. **Day 4**: Experiment with different Ollama models
5. **Day 5**: Build your own custom workflow

### Advanced Usage

```bash
# Try different Ollama models
ollama pull gemma2:9b      # Larger, better quality
ollama pull llama3.2:3b    # Meta's Llama
ollama pull mistral:7b     # Mistral AI
ollama pull phi3:mini      # Microsoft Phi-3

# Then modify ollamaService.ts:
const DEFAULT_MODEL = 'llama3.2:3b';
```

## 💡 Tips & Tricks

### Performance Tips
1. Use Gemini for large documents (>10 questions)
2. Use Gemma 2B for small batches (<5 questions)
3. Keep Ollama running in background for faster startup
4. Pre-download models you'll use frequently

### Privacy Tips
1. Use Gemma 2B for sensitive documents
2. Gemini for non-confidential content
3. Check your organization's AI policy
4. Local models = complete data privacy

### Cost Optimization
1. Use Gemma 2B for testing/development
2. Use Gemini for final production runs
3. Batch process multiple documents together
4. Cache results when possible

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] App runs (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] See model selector buttons
- [ ] Gemini button works (if API key set)
- [ ] Ollama installed (optional)
- [ ] Gemma 2B model downloaded (optional)
- [ ] Gemma 2B button works (if Ollama running)
- [ ] Can upload files
- [ ] Can process documents
- [ ] Can download results

## 🆘 Getting Help

### Resources
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Gemma Model Info](https://ai.google.dev/gemma)

### Common Questions

**Q: Which model should I use?**
A: Start with Gemini for quality, switch to Gemma 2B for privacy/cost.

**Q: Can I use both at the same time?**
A: Not simultaneously, but you can switch between them anytime.

**Q: Is my data safe with Gemini?**
A: Google processes it according to their privacy policy. Use Gemma 2B for sensitive data.

**Q: How much does Gemini cost?**
A: ~$0.075 per 1 million tokens. Most documents cost <$0.01.

**Q: Is Gemma 2B really free?**
A: Yes! Completely free to use locally. Only costs are electricity and hardware.

## 🎊 You're All Set!

You now have a powerful AI document processor with:
- ✅ Cloud AI (Gemini)
- ✅ Local AI (Gemma 2B)
- ✅ Easy model switching
- ✅ Beautiful UI
- ✅ Privacy options
- ✅ Cost flexibility

**Happy Processing! 🚀**

---

*Need more help? Check the other documentation files or open an issue!*
