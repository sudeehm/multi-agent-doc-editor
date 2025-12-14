# AutoSolver Architecture - Hybrid AI System

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AutoSolver UI                             │
│                    (React + TypeScript)                          │
│                                                                   │
│  ┌──────────────┐                        ┌──────────────┐       │
│  │   Gemini     │                        │  Gemma 2B    │       │
│  │   (Cloud)    │                        │   (Local)    │       │
│  └──────────────┘                        └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
         │                                          │
         │                                          │
         ▼                                          ▼
┌─────────────────┐                      ┌─────────────────┐
│  Gemini Service │                      │ Ollama Service  │
│                 │                      │                 │
│ - API calls     │                      │ - Local HTTP    │
│ - JSON schema   │                      │ - REST API      │
│ - Rate limiting │                      │ - No limits     │
└─────────────────┘                      └─────────────────┘
         │                                          │
         │                                          │
         ▼                                          ▼
┌─────────────────┐                      ┌─────────────────┐
│  Google Cloud   │                      │ Ollama Runtime  │
│                 │                      │                 │
│ - Gemini 2.5    │                      │ - Gemma 2B      │
│ - Flash model   │                      │ - Local model   │
│ - 1M+ context   │                      │ - 8K context    │
└─────────────────┘                      └─────────────────┘
```

## Data Flow

### With Gemini API (Cloud)
```
User Document → Reader Agent → Gemini API → Cloud Processing → Response → UI
                                    │
                                    └─→ Internet Required
                                        API Key Required
                                        Pay per token
```

### With Ollama + Gemma 2B (Local)
```
User Document → Reader Agent → Ollama HTTP → Local Processing → Response → UI
                                    │
                                    └─→ No Internet
                                        No API Key
                                        100% Free
```

## Multi-Agent Pipeline

```
┌──────────────┐
│   READER     │  Extracts text from DOCX/TXT files
│    Agent     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   ANALYST    │  Segments text into individual questions
│    Agent     │  Uses: Gemini OR Ollama
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   SOLVER     │  Answers each question using source notes
│    Agent     │  Uses: Gemini OR Ollama
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   WRITER     │  Compiles answers into DOCX document
│    Agent     │
└──────────────┘
```

## Model Comparison

| Feature              | Gemini 2.5 Flash      | Gemma 2B (Ollama)    |
|---------------------|-----------------------|----------------------|
| **Location**        | Google Cloud          | Your Computer        |
| **Cost**            | $0.075/1M tokens      | Free                 |
| **Speed**           | ~2s per question      | ~5s per question     |
| **Context Window**  | 1M+ tokens            | 8K tokens            |
| **Quality**         | Excellent             | Good                 |
| **Privacy**         | Data sent to Google   | 100% Local           |
| **Internet**        | Required              | Not Required         |
| **Rate Limits**     | 15 RPM (free tier)    | None                 |
| **Setup**           | API key only          | Install + Download   |

## File Structure

```
autosolver---multi-agent-doc-editor/
├── services/
│   ├── geminiService.ts      # Gemini API integration
│   ├── ollamaService.ts      # Ollama local AI integration
│   └── documentService.ts    # Document processing
├── components/
│   └── AgentTerminal.tsx     # Live agent logs
├── App.tsx                   # Main UI with model selector
├── types.ts                  # TypeScript definitions
├── README.md                 # Quick start guide
├── OLLAMA_SETUP.md          # Detailed Ollama guide
└── setup-ollama.ps1         # Windows setup script
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons
- **Tailwind CSS** - Styling (via utility classes)

### AI Services
- **@google/genai** - Gemini API SDK
- **Ollama HTTP API** - Local LLM runtime
- **Gemma 2B** - Open-source Google model

### Document Processing
- **mammoth** - DOCX reading
- **docx** - DOCX writing
- **file-saver** - File downloads

## API Endpoints

### Ollama API (Local - Port 11434)

```
GET  /api/tags              # List installed models
POST /api/generate          # Generate completion
POST /api/pull              # Download model
GET  /                      # Health check
```

### Gemini API (Cloud)

```
POST /v1/models/gemini-2.5-flash:generateContent
     Headers: x-goog-api-key: YOUR_API_KEY
     Body: { contents, config }
```

## Environment Variables

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here  # Optional if using Ollama
```

## Performance Optimization

### Gemini Optimizations
- Use Flash model for speed
- Batch similar requests
- Implement retry logic
- Cache responses when possible

### Ollama Optimizations
- Reduce context window for faster processing
- Use smaller models (2B vs 9B)
- Process documents in parallel
- Keep model loaded in memory

## Security Considerations

### Gemini API
- ✅ HTTPS encryption
- ✅ API key authentication
- ⚠️ Data sent to Google
- ⚠️ Subject to Google's privacy policy

### Ollama Local
- ✅ No data leaves your machine
- ✅ No authentication required
- ✅ Complete privacy
- ⚠️ Runs on localhost (not exposed)

## Deployment Options

### Development
```bash
npm run dev  # Runs on localhost:3000
```

### Production (Gemini)
```bash
npm run build
npm run preview
```

### Production (Ollama)
- Requires Ollama installed on server
- Model must be pre-downloaded
- Ensure port 11434 is accessible

## Future Enhancements

### Planned Features
- [ ] Support for more Ollama models (Llama, Mistral, etc.)
- [ ] Model performance comparison dashboard
- [ ] Automatic model selection based on document size
- [ ] Hybrid mode (use both Gemini + Ollama)
- [ ] GPU acceleration for Ollama
- [ ] Model fine-tuning support
- [ ] Multi-language support
- [ ] PDF document support
- [ ] Real-time collaboration

### Advanced Use Cases
- **Hybrid Processing**: Use Gemini for analysis, Ollama for solving
- **Fallback Strategy**: Try Ollama first, fallback to Gemini if needed
- **Cost Optimization**: Use Ollama for bulk processing, Gemini for quality checks
- **Privacy Mode**: Force Ollama for sensitive documents

## Troubleshooting

### Common Issues

1. **Ollama not detected**
   - Check if Ollama is running: `ollama list`
   - Restart Ollama service
   - Verify port 11434 is accessible

2. **Model not found**
   - Pull the model: `ollama pull gemma2:2b`
   - Check installed models: `ollama list`

3. **Out of memory**
   - Use smaller model (gemma2:2b)
   - Close other applications
   - Reduce document size

4. **Slow performance**
   - Switch to Gemini for large documents
   - Use smaller model
   - Enable GPU acceleration (if available)

## Contributing

We welcome contributions! Areas of interest:
- Additional model integrations
- Performance optimizations
- UI/UX improvements
- Documentation enhancements

## License

This project uses:
- Gemini API: Subject to Google's terms
- Gemma model: Gemma Terms of Use
- Ollama: MIT License

---

**Built with ❤️ for the AI community**
