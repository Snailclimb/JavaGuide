#!/usr/bin/env python3
"""
Batch Translation Tool for Repository Documentation

Translates all markdown files in docs/ folder to target language.
Preserves directory structure and saves to docs_{lang}/ folder.
"""

import os
import sys
import time
import json
from pathlib import Path
from deep_translator import GoogleTranslator

# Language configurations
LANGUAGES = {
    '1': {'name': 'English', 'code': 'en', 'suffix': 'en'},
    '2': {'name': 'Chinese (Simplified)', 'code': 'zh-CN', 'suffix': 'zh'},
    '3': {'name': 'Spanish', 'code': 'es', 'suffix': 'es'},
    '4': {'name': 'French', 'code': 'fr', 'suffix': 'fr'},
    '5': {'name': 'Portuguese', 'code': 'pt', 'suffix': 'pt'},
    '6': {'name': 'German', 'code': 'de', 'suffix': 'de'},
    '7': {'name': 'Japanese', 'code': 'ja', 'suffix': 'ja'},
    '8': {'name': 'Korean', 'code': 'ko', 'suffix': 'ko'},
    '9': {'name': 'Russian', 'code': 'ru', 'suffix': 'ru'},
    '10': {'name': 'Italian', 'code': 'it', 'suffix': 'it'},
    '11': {'name': 'Arabic', 'code': 'ar', 'suffix': 'ar'},
    '12': {'name': 'Hindi', 'code': 'hi', 'suffix': 'hi'},
    '13': {'name': 'Turkish', 'code': 'tr', 'suffix': 'tr'},
    '14': {'name': 'Vietnamese', 'code': 'vi', 'suffix': 'vi'},
    '15': {'name': 'Polish', 'code': 'pl', 'suffix': 'pl'},
    '16': {'name': 'Dutch', 'code': 'nl', 'suffix': 'nl'},
    '17': {'name': 'Indonesian', 'code': 'id', 'suffix': 'id'},
    '18': {'name': 'Thai', 'code': 'th', 'suffix': 'th'},
    '19': {'name': 'Swedish', 'code': 'sv', 'suffix': 'sv'},
    '20': {'name': 'Greek', 'code': 'el', 'suffix': 'el'},
}

CHUNK_SIZE = 4000  # Characters per chunk
PROGRESS_FILE = '.translation_progress.json'


def print_header():
    print("=" * 70)
    print("Repository Documentation Translation Tool")
    print("=" * 70)
    print()


def select_language():
    """Let user select target language"""
    print("=" * 70)
    print("Select target language:")
    print("=" * 70)
    
    for num, lang in LANGUAGES.items():
        print(f"  {num:>2}. {lang['name']}")
    
    print()
    while True:
        choice = input("Enter choice (1-20): ").strip()
        if choice in LANGUAGES:
            return LANGUAGES[choice]
        print("❌ Invalid choice. Please enter a number between 1-20.")


def find_markdown_files(repo_path):
    """Find all markdown files in docs/ folder and README.md"""
    repo_path = Path(repo_path)
    docs_path = repo_path / 'docs'
    
    files = []
    
    # Add README.md if exists
    readme = repo_path / 'README.md'
    if readme.exists():
        files.append(readme)
    
    # Add all .md files in docs/
    if docs_path.exists():
        for md_file in docs_path.rglob('*.md'):
            files.append(md_file)
    
    return sorted(files)


def get_output_path(input_path, repo_path, lang_suffix):
    """
    Convert input path to output path.
    docs/java/basics.md -> docs_en/java/basics.en.md
    README.md -> README.en.md
    """
    repo_path = Path(repo_path)
    input_path = Path(input_path)
    
    # Handle README.md
    if input_path.name == 'README.md':
        return repo_path / f'README.{lang_suffix}.md'
    
    # Handle docs/ files
    relative = input_path.relative_to(repo_path / 'docs')
    
    # Change extension: file.md -> file.{lang}.md
    stem = relative.stem
    new_name = f'{stem}.{lang_suffix}.md'
    
    output_path = repo_path / f'docs_{lang_suffix}' / relative.parent / new_name
    return output_path


def split_content(content, chunk_size=CHUNK_SIZE):
    """Split content into chunks, preserving code blocks"""
    chunks = []
    current_chunk = ""
    in_code_block = False
    
    lines = content.split('\n')
    
    for line in lines:
        # Track code blocks
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
        
        # If adding this line exceeds chunk size and we're not in a code block
        if len(current_chunk) + len(line) > chunk_size and not in_code_block and current_chunk:
            chunks.append(current_chunk)
            current_chunk = line + '\n'
        else:
            current_chunk += line + '\n'
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks


def translate_text(text, target_lang):
    """Translate text using Google Translate"""
    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        print(f"\n⚠️  Translation error: {e}")
        return text  # Return original on error


def translate_file(input_path, output_path, lang_code):
    """Translate a single markdown file"""
    # Read input
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split into chunks
    chunks = split_content(content)
    
    # Translate each chunk
    translated_chunks = []
    for i, chunk in enumerate(chunks, 1):
        print(f"    Chunk {i}/{len(chunks)}... ", end='', flush=True)
        translated = translate_text(chunk, lang_code)
        translated_chunks.append(translated)
        print("✅")
        time.sleep(1)  # Rate limiting
    
    # Combine translated chunks
    translated_content = ''.join(translated_chunks)
    
    # Create output directory
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(translated_content)
    
    return len(content), len(translated_content)


def load_progress(repo_path):
    """Load translation progress"""
    progress_file = Path(repo_path) / PROGRESS_FILE
    if progress_file.exists():
        with open(progress_file, 'r') as f:
            return json.load(f)
    return {'completed': [], 'failed': []}


def save_progress(repo_path, progress):
    """Save translation progress"""
    progress_file = Path(repo_path) / PROGRESS_FILE
    with open(progress_file, 'w') as f:
        json.dump(progress, f, indent=2)


def main():
    print_header()
    
    # Get repository path
    repo_path = input("Enter repository path (default: current directory): ").strip()
    if not repo_path:
        repo_path = '.'
    
    repo_path = Path(repo_path).resolve()
    
    if not repo_path.exists():
        print(f"❌ Repository path does not exist: {repo_path}")
        sys.exit(1)
    
    print(f"📁 Repository: {repo_path}")
    print()
    
    # Select language
    lang_config = select_language()
    print(f"\n✨ Selected: {lang_config['name']}")
    print()
    
    # Find all markdown files
    print("🔍 Finding markdown files...")
    md_files = find_markdown_files(repo_path)
    
    if not md_files:
        print("❌ No markdown files found in docs/ folder or README.md")
        sys.exit(1)
    
    print(f"📄 Found {len(md_files)} markdown files")
    print()
    
    # Load progress
    progress = load_progress(repo_path)
    
    # Filter out already completed files
    files_to_translate = []
    for f in md_files:
        output_path = get_output_path(f, repo_path, lang_config['suffix'])
        if output_path.exists():
            print(f"⏭️  Skipping (exists): {f.relative_to(repo_path)}")
        elif str(f) in progress['completed']:
            print(f"⏭️  Skipping (completed): {f.relative_to(repo_path)}")
        else:
            files_to_translate.append(f)
    
    if not files_to_translate:
        print("\n✅ All files already translated!")
        sys.exit(0)
    
    print(f"\n📝 Files to translate: {len(files_to_translate)}")
    print()
    
    # Confirm
    confirm = input(f"Translate {len(files_to_translate)} files to {lang_config['name']}? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Translation cancelled")
        sys.exit(0)
    
    print()
    print("=" * 70)
    print(f"Translating to {lang_config['name']}...")
    print("=" * 70)
    print()
    
    # Translate files
    total_input_chars = 0
    total_output_chars = 0
    failed_files = []
    
    for idx, input_path in enumerate(files_to_translate, 1):
        relative_path = input_path.relative_to(repo_path)
        output_path = get_output_path(input_path, repo_path, lang_config['suffix'])
        
        print(f"[{idx}/{len(files_to_translate)}] {relative_path}")
        print(f"  → {output_path.relative_to(repo_path)}")
        
        try:
            input_chars, output_chars = translate_file(input_path, output_path, lang_config['code'])
            total_input_chars += input_chars
            total_output_chars += output_chars
            
            # Mark as completed
            progress['completed'].append(str(input_path))
            save_progress(repo_path, progress)
            
            print(f"  ✅ Translated ({input_chars} → {output_chars} chars)")
            print()
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
            failed_files.append((str(relative_path), str(e)))
            progress['failed'].append(str(input_path))
            save_progress(repo_path, progress)
            print()
    
    # Summary
    print("=" * 70)
    print("Translation Complete!")
    print("=" * 70)
    print(f"✅ Translated: {len(files_to_translate) - len(failed_files)} files")
    print(f"📊 Input: {total_input_chars:,} characters")
    print(f"📊 Output: {total_output_chars:,} characters")
    
    if failed_files:
        print(f"\n❌ Failed: {len(failed_files)} files")
        for file, error in failed_files:
            print(f"  - {file}: {error}")
    
    print(f"\n📁 Output directory: docs_{lang_config['suffix']}/")
    print(f"📁 README: README.{lang_config['suffix']}.md")
    print()
    print("💡 Next steps:")
    print(f"   1. Review translated files in docs_{lang_config['suffix']}/")
    print(f"   2. git add docs_{lang_config['suffix']}/ README.{lang_config['suffix']}.md")
    print(f"   3. git commit -m 'Add {lang_config['name']} translation'")
    print("   4. Create PR")
    print()


if __name__ == "__main__":
    main()
