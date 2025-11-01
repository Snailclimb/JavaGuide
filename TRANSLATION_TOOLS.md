# Translation Tools for JavaGuide

This repository includes automated translation tools to translate all documentation to multiple languages.

## Available Tools

### 1. Python Version (`translate_repo.py`)

**Requirements:**
```bash
pip install deep-translator
```

**Usage:**
```bash
python3 translate_repo.py
```

**Features:**
- ✅ Uses Google Translate (free, no API key required)
- ✅ Translates all `.md` files in `docs/` folder + `README.md`
- ✅ Preserves directory structure
- ✅ Progress tracking (saves to `.translation_progress.json`)
- ✅ Skips already translated files
- ✅ Rate limiting to avoid API throttling
- ✅ Supports 20 languages

### 2. Java Version (`TranslateRepo.java`)

**Requirements:**
```bash
# Requires Gson library
# Download from: https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar
```

**Compile:**
```bash
javac -cp gson-2.10.1.jar TranslateRepo.java
```

**Usage:**
```bash
java -cp .:gson-2.10.1.jar TranslateRepo
```

**Features:**
- ✅ Pure Java implementation
- ✅ Uses Google Translate API (free, no key required)
- ✅ Same functionality as Python version
- ✅ Progress tracking with JSON
- ✅ Supports 20 languages

## Supported Languages

1. English (en)
2. Chinese Simplified (zh)
3. Spanish (es)
4. French (fr)
5. Portuguese (pt)
6. German (de)
7. Japanese (ja)
8. Korean (ko)
9. Russian (ru)
10. Italian (it)
11. Arabic (ar)
12. Hindi (hi)
13. Turkish (tr)
14. Vietnamese (vi)
15. Polish (pl)
16. Dutch (nl)
17. Indonesian (id)
18. Thai (th)
19. Swedish (sv)
20. Greek (el)

## Output Structure

Original:
```
docs/
├── java/
│   └── basics.md
└── ...
README.md
```

After translation to English:
```
docs_en/
├── java/
│   └── basics.en.md
└── ...
README.en.md
```

## How It Works

1. **Scans** all `.md` files in `docs/` folder and `README.md`
2. **Splits** large files into chunks (4000 chars) to respect API limits
3. **Translates** each chunk using Google Translate
4. **Preserves** markdown formatting and code blocks
5. **Saves** to `docs_{lang}/` with `.{lang}.md` suffix
6. **Tracks** progress to resume if interrupted

## Example Workflow

```bash
# 1. Run translation tool
python3 translate_repo.py

# 2. Select language (e.g., 1 for English)
Enter choice (1-20): 1

# 3. Confirm translation
Translate 292 files to English? (y/n): y

# 4. Wait for completion (progress shown for each file)
[1/292] docs/java/basics/java-basic-questions-01.md
  → docs_en/java/basics/java-basic-questions-01.en.md
    Chunk 1/3... ✅
    Chunk 2/3... ✅
    Chunk 3/3... ✅
  ✅ Translated (5234 → 6891 chars)

# 5. Review and commit
git add docs_en/ README.en.md
git commit -m "Add English translation"
git push
```

## Progress Tracking

The tool saves progress to `.translation_progress.json`:
```json
{
  "completed": [
    "docs/java/basics/file1.md",
    "docs/java/basics/file2.md"
  ],
  "failed": []
}
```

If interrupted, simply run the tool again - it will skip completed files and resume where it left off.

## Performance

- **Speed**: ~1 file per 5-10 seconds (depending on file size)
- **For JavaGuide**: 292 files ≈ 2-3 hours total
- **Rate limiting**: 1 second delay between chunks to avoid throttling

## Notes

- ✅ Free to use (no API key required)
- ✅ Preserves markdown formatting
- ✅ Handles code blocks correctly
- ✅ Skips existing translations
- ⚠️ Review translations for accuracy (automated translation may have errors)
- ⚠️ Large repos may take several hours

## Contributing

After running the translation tool:

1. Review translated files for accuracy
2. Fix any translation errors manually
3. Test that links and formatting work correctly
4. Create a pull request with your translations

## License

These tools are provided as-is for translating JavaGuide documentation.
