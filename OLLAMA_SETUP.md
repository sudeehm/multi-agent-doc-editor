# 🚀 Ollama + Gemma 2B Integration Guide

This project now supports **local AI processing** using Ollama with the Gemma 2B model! You can choose between:
- **Gemini API** (Cloud-based, requires API key)
- **Ollama + Gemma 2B** (Local, free, private, offline)

## 🎯 Quick Start with Ollama

### Step 1: Install Ollama

**Windows:**
1. Download Ollama from: https://ollama.com/download/windows
2. Run the installer (OllamaSetup.exe)
3. Ollama will start automatically in the background

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Pull Gemma 2B Model

Open a terminal and run:
```bash
ollama pull gemma2:2b
```

This will download the Gemma 2B model (~1.6GB). Wait for it to complete.

### Step 3: Verify Installation

Check if Ollama is running:
```bash
ollama list
```

You should see `gemma2:2b` in the list.

### Step 4: Run the Application

```bash
npm install
npm run dev
```

The app will automatically detect Ollama and enable the "Gemma 2B" button in the UI!

## 🎨 Using the UI

1. **Model Selection**: In the top-right corner, you'll see two buttons:
   - **Gemini** (Cloud icon) - Uses Google's Gemini API
   - **Gemma 2B** (CPU icon) - Uses local Ollama with Gemma 2B

2. **Switch Models**: Click either button to switch between providers
   - If Ollama is not detected, the Gemma 2B button will be disabled
   - The system log will show which provider is active

3. **Process Documents**: Upload your question bank and source materials, then click "Start Processing"

## 🔧 Advanced Configuration

### Using Different Models

You can use other Ollama models by modifying `services/ollamaService.ts`:

```typescript
const DEFAULT_MODEL = 'gemma2:2b'; // Change this to any Ollama model
```

Available models:
- `gemma2:2b` - Gemma 2B (recommended, fast, 1.6GB)
- `gemma2:9b` - Gemma 9B (better quality, slower, 5.4GB)
- `llama3.2:3b` - Llama 3.2 3B (3.2GB)
- `mistral:7b` - Mistral 7B (4.1GB)
- `phi3:mini` - Phi-3 Mini (2.3GB)

Pull any model with:
```bash
ollama pull <model-name>
```

### Performance Tips

1. **Context Length**: Gemma 2B has a smaller context window than Gemini. For very large documents, consider:
   - Using Gemini for analysis
   - Splitting documents into smaller chunks
   - Using a larger model like `gemma2:9b`

2. **Speed**: Local models are generally slower than cloud APIs but:
   - No API rate limits
   - No internet required
   - Complete privacy
   - No API costs

3. **Memory**: Ensure you have enough RAM:
   - Gemma 2B: ~4GB RAM
   - Gemma 9B: ~12GB RAM
   - Llama 3.2 3B: ~6GB RAM

## 🆚 Gemini vs Ollama Comparison

| Feature | Gemini API | Ollama (Gemma 2B) |
|---------|-----------|-------------------|
| **Cost** | Pay per token | Free |
| **Speed** | Very fast | Moderate |
| **Privacy** | Data sent to Google | 100% local |
| **Internet** | Required | Not required |
| **Quality** | Excellent | Good |
| **Context Length** | 1M+ tokens | ~8K tokens |
| **Setup** | API key only | Install Ollama + model |

## 🐛 Troubleshooting

### Ollama Not Detected

**Issue**: "Gemma 2B (offline)" button is disabled

**Solutions**:
1. Check if Ollama is running:
   ```bash
   ollama list
   ```
2. Restart Ollama:
   - Windows: Restart from system tray
   - macOS/Linux: `ollama serve`
3. Check if port 11434 is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Model Not Found

**Issue**: Error "model not found"

**Solution**: Pull the model first:
```bash
ollama pull gemma2:2b
```

### Slow Performance

**Issue**: Processing is very slow

**Solutions**:
1. Use a smaller model (gemma2:2b is already the smallest)
2. Reduce document size
3. Use Gemini API for large batches
4. Upgrade your hardware (more RAM/better CPU)

### Out of Memory

**Issue**: System runs out of memory

**Solutions**:
1. Close other applications
2. Use a smaller model
3. Reduce batch size in the code
4. Add more RAM to your system

## 🔐 Privacy & Security

### Why Use Local AI?

- **Data Privacy**: Your documents never leave your machine
- **Compliance**: Perfect for sensitive/confidential documents
- **Offline Work**: No internet required after model download
- **No Vendor Lock-in**: Not dependent on any API service

### Data Flow

**With Gemini**:
```
Your Computer → Internet → Google Servers → Response → Your Computer
```

**With Ollama**:
```
Your Computer → Ollama (Local) → Response (All local)
```

## 📊 Performance Benchmarks

Based on typical usage:

| Task | Gemini API | Gemma 2B (Local) |
|------|-----------|------------------|
| Analyze 10 questions | ~3 seconds | ~8 seconds |
| Solve 1 question | ~2 seconds | ~5 seconds |
| Process full document | ~30 seconds | ~90 seconds |

*Times vary based on document size and hardware*

## 🎓 Model Information

### Gemma 2B
- **Developer**: Google
- **Size**: 2 billion parameters
- **License**: Open source (Gemma license)
- **Best for**: Fast inference, low resource usage
- **Context**: 8K tokens
- **Languages**: Primarily English

### When to Use Which?

**Use Gemini API when**:
- You need the highest quality answers
- Processing very large documents
- Speed is critical
- You have a stable internet connection

**Use Ollama (Gemma 2B) when**:
- Privacy is important
- Working offline
- Want to avoid API costs
- Processing moderate-sized documents
- Learning/experimenting with AI

## 🔄 Switching Between Models

You can switch between Gemini and Ollama at any time:

1. Before starting a job (recommended)
2. After completing a job
3. The app will remember your preference

**Note**: You cannot switch models during processing.

## 📝 Example Workflow

### Scenario: Processing Exam Questions

1. **Upload Files**:
   - Question bank: `midterm_questions.docx`
   - Source materials: `lecture_notes.pdf`, `textbook_chapter3.docx`

2. **Choose Model**:
   - For quick testing: Use **Gemma 2B** (local, free)
   - For final version: Use **Gemini** (higher quality)

3. **Process**:
   - Click "Start Processing"
   - Watch the live preview
   - Download the completed document

4. **Review**:
   - Check answer quality
   - If needed, switch to Gemini and reprocess

## 🌟 Best Practices

1. **Start with Gemma 2B**: Test your workflow locally first
2. **Use Gemini for Production**: When you need the best results
3. **Keep Models Updated**: Run `ollama pull gemma2:2b` occasionally
4. **Monitor Resources**: Check CPU/RAM usage during processing
5. **Batch Processing**: Process multiple documents in one session

## 🤝 Contributing

Found a bug or have a suggestion? Please open an issue!

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Gemma Model Card](https://ai.google.dev/gemma)
- [Gemini API Docs](https://ai.google.dev/docs)

---

**Happy Processing! 🎉**
