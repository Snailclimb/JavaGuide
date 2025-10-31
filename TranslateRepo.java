import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import com.google.gson.*;

/**
 * Repository Documentation Translation Tool
 * 
 * Translates all markdown files in docs/ folder to target language.
 * Preserves directory structure and saves to docs_{lang}/ folder.
 * 
 * Usage: java TranslateRepo
 */
public class TranslateRepo {
    
    private static final int CHUNK_SIZE = 4000;
    private static final String PROGRESS_FILE = ".translation_progress.json";
    private static final Map<String, Language> LANGUAGES = new LinkedHashMap<>();
    
    static {
        LANGUAGES.put("1", new Language("English", "en", "en"));
        LANGUAGES.put("2", new Language("Chinese (Simplified)", "zh-CN", "zh"));
        LANGUAGES.put("3", new Language("Spanish", "es", "es"));
        LANGUAGES.put("4", new Language("French", "fr", "fr"));
        LANGUAGES.put("5", new Language("Portuguese", "pt", "pt"));
        LANGUAGES.put("6", new Language("German", "de", "de"));
        LANGUAGES.put("7", new Language("Japanese", "ja", "ja"));
        LANGUAGES.put("8", new Language("Korean", "ko", "ko"));
        LANGUAGES.put("9", new Language("Russian", "ru", "ru"));
        LANGUAGES.put("10", new Language("Italian", "it", "it"));
        LANGUAGES.put("11", new Language("Arabic", "ar", "ar"));
        LANGUAGES.put("12", new Language("Hindi", "hi", "hi"));
        LANGUAGES.put("13", new Language("Turkish", "tr", "tr"));
        LANGUAGES.put("14", new Language("Vietnamese", "vi", "vi"));
        LANGUAGES.put("15", new Language("Polish", "pl", "pl"));
        LANGUAGES.put("16", new Language("Dutch", "nl", "nl"));
        LANGUAGES.put("17", new Language("Indonesian", "id", "id"));
        LANGUAGES.put("18", new Language("Thai", "th", "th"));
        LANGUAGES.put("19", new Language("Swedish", "sv", "sv"));
        LANGUAGES.put("20", new Language("Greek", "el", "el"));
    }
    
    static class Language {
        String name;
        String code;
        String suffix;
        
        Language(String name, String code, String suffix) {
            this.name = name;
            this.code = code;
            this.suffix = suffix;
        }
    }
    
    static class TranslationProgress {
        Set<String> completed = new HashSet<>();
        Set<String> failed = new HashSet<>();
    }
    
    public static void main(String[] args) {
        try {
            printHeader();
            
            // Get repository path
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter repository path (default: current directory): ");
            String repoPathStr = scanner.nextLine().trim();
            if (repoPathStr.isEmpty()) {
                repoPathStr = ".";
            }
            
            Path repoPath = Paths.get(repoPathStr).toAbsolutePath();
            if (!Files.exists(repoPath)) {
                System.out.println("❌ Repository path does not exist: " + repoPath);
                return;
            }
            
            System.out.println("📁 Repository: " + repoPath);
            System.out.println();
            
            // Select language
            Language language = selectLanguage(scanner);
            System.out.println("\n✨ Selected: " + language.name);
            System.out.println();
            
            // Find markdown files
            System.out.println("🔍 Finding markdown files...");
            List<Path> mdFiles = findMarkdownFiles(repoPath);
            
            if (mdFiles.isEmpty()) {
                System.out.println("❌ No markdown files found in docs/ folder or README.md");
                return;
            }
            
            System.out.println("📄 Found " + mdFiles.size() + " markdown files");
            System.out.println();
            
            // Load progress
            TranslationProgress progress = loadProgress(repoPath);
            
            // Filter files
            List<Path> filesToTranslate = new ArrayList<>();
            for (Path file : mdFiles) {
                Path outputPath = getOutputPath(file, repoPath, language.suffix);
                if (Files.exists(outputPath)) {
                    System.out.println("⏭️  Skipping (exists): " + repoPath.relativize(file));
                } else if (progress.completed.contains(file.toString())) {
                    System.out.println("⏭️  Skipping (completed): " + repoPath.relativize(file));
                } else {
                    filesToTranslate.add(file);
                }
            }
            
            if (filesToTranslate.isEmpty()) {
                System.out.println("\n✅ All files already translated!");
                return;
            }
            
            System.out.println("\n📝 Files to translate: " + filesToTranslate.size());
            System.out.println();
            
            // Confirm
            System.out.print("Translate " + filesToTranslate.size() + " files to " + language.name + "? (y/n): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            if (!confirm.equals("y")) {
                System.out.println("❌ Translation cancelled");
                return;
            }
            
            System.out.println();
            System.out.println("=".repeat(70));
            System.out.println("Translating to " + language.name + "...");
            System.out.println("=".repeat(70));
            System.out.println();
            
            // Translate files
            int totalInputChars = 0;
            int totalOutputChars = 0;
            List<String> failedFiles = new ArrayList<>();
            
            for (int i = 0; i < filesToTranslate.size(); i++) {
                Path inputPath = filesToTranslate.get(i);
                Path relativePath = repoPath.relativize(inputPath);
                Path outputPath = getOutputPath(inputPath, repoPath, language.suffix);
                
                System.out.println("[" + (i + 1) + "/" + filesToTranslate.size() + "] " + relativePath);
                System.out.println("  → " + repoPath.relativize(outputPath));
                
                try {
                    int[] chars = translateFile(inputPath, outputPath, language.code);
                    totalInputChars += chars[0];
                    totalOutputChars += chars[1];
                    
                    progress.completed.add(inputPath.toString());
                    saveProgress(repoPath, progress);
                    
                    System.out.println("  ✅ Translated (" + chars[0] + " → " + chars[1] + " chars)");
                    System.out.println();
                    
                } catch (Exception e) {
                    System.out.println("  ❌ Failed: " + e.getMessage());
                    failedFiles.add(relativePath.toString());
                    progress.failed.add(inputPath.toString());
                    saveProgress(repoPath, progress);
                    System.out.println();
                }
            }
            
            // Summary
            System.out.println("=".repeat(70));
            System.out.println("Translation Complete!");
            System.out.println("=".repeat(70));
            System.out.println("✅ Translated: " + (filesToTranslate.size() - failedFiles.size()) + " files");
            System.out.println("📊 Input: " + String.format("%,d", totalInputChars) + " characters");
            System.out.println("📊 Output: " + String.format("%,d", totalOutputChars) + " characters");
            
            if (!failedFiles.isEmpty()) {
                System.out.println("\n❌ Failed: " + failedFiles.size() + " files");
                for (String file : failedFiles) {
                    System.out.println("  - " + file);
                }
            }
            
            System.out.println("\n📁 Output directory: docs_" + language.suffix + "/");
            System.out.println("📁 README: README." + language.suffix + ".md");
            System.out.println();
            System.out.println("💡 Next steps:");
            System.out.println("   1. Review translated files in docs_" + language.suffix + "/");
            System.out.println("   2. git add docs_" + language.suffix + "/ README." + language.suffix + ".md");
            System.out.println("   3. git commit -m 'Add " + language.name + " translation'");
            System.out.println("   4. Create PR");
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void printHeader() {
        System.out.println("=".repeat(70));
        System.out.println("Repository Documentation Translation Tool");
        System.out.println("=".repeat(70));
        System.out.println();
    }
    
    private static Language selectLanguage(Scanner scanner) {
        System.out.println("=".repeat(70));
        System.out.println("Select target language:");
        System.out.println("=".repeat(70));
        
        for (Map.Entry<String, Language> entry : LANGUAGES.entrySet()) {
            System.out.printf("  %2s. %s%n", entry.getKey(), entry.getValue().name);
        }
        
        System.out.println();
        while (true) {
            System.out.print("Enter choice (1-20): ");
            String choice = scanner.nextLine().trim();
            if (LANGUAGES.containsKey(choice)) {
                return LANGUAGES.get(choice);
            }
            System.out.println("❌ Invalid choice. Please enter a number between 1-20.");
        }
    }
    
    private static List<Path> findMarkdownFiles(Path repoPath) throws IOException {
        List<Path> files = new ArrayList<>();
        
        // Add README.md
        Path readme = repoPath.resolve("README.md");
        if (Files.exists(readme)) {
            files.add(readme);
        }
        
        // Add all .md files in docs/
        Path docsPath = repoPath.resolve("docs");
        if (Files.exists(docsPath)) {
            Files.walk(docsPath)
                .filter(p -> p.toString().endsWith(".md"))
                .forEach(files::add);
        }
        
        Collections.sort(files);
        return files;
    }
    
    private static Path getOutputPath(Path inputPath, Path repoPath, String langSuffix) {
        String fileName = inputPath.getFileName().toString();
        
        // Handle README.md
        if (fileName.equals("README.md")) {
            return repoPath.resolve("README." + langSuffix + ".md");
        }
        
        // Handle docs/ files
        Path docsPath = repoPath.resolve("docs");
        Path relative = docsPath.relativize(inputPath);
        
        // Change extension: file.md -> file.{lang}.md
        String stem = fileName.substring(0, fileName.length() - 3);
        String newName = stem + "." + langSuffix + ".md";
        
        return repoPath.resolve("docs_" + langSuffix).resolve(relative.getParent()).resolve(newName);
    }
    
    private static int[] translateFile(Path inputPath, Path outputPath, String targetLang) throws IOException {
        // Read input
        String content = Files.readString(inputPath, StandardCharsets.UTF_8);
        int inputChars = content.length();
        
        // Split into chunks
        List<String> chunks = splitContent(content, CHUNK_SIZE);
        
        // Translate chunks
        StringBuilder translated = new StringBuilder();
        for (int i = 0; i < chunks.size(); i++) {
            System.out.print("    Chunk " + (i + 1) + "/" + chunks.size() + "... ");
            String translatedChunk = translateText(chunks.get(i), targetLang);
            translated.append(translatedChunk);
            System.out.println("✅");
            
            try {
                Thread.sleep(1000); // Rate limiting
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        String translatedContent = translated.toString();
        int outputChars = translatedContent.length();
        
        // Create output directory
        Files.createDirectories(outputPath.getParent());
        
        // Write output
        Files.writeString(outputPath, translatedContent, StandardCharsets.UTF_8);
        
        return new int[]{inputChars, outputChars};
    }
    
    private static List<String> splitContent(String content, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();
        boolean inCodeBlock = false;
        
        for (String line : content.split("\n")) {
            if (line.trim().startsWith("```")) {
                inCodeBlock = !inCodeBlock;
            }
            
            if (currentChunk.length() + line.length() > chunkSize && !inCodeBlock && currentChunk.length() > 0) {
                chunks.add(currentChunk.toString());
                currentChunk = new StringBuilder();
            }
            
            currentChunk.append(line).append("\n");
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }
        
        return chunks;
    }
    
    private static String translateText(String text, String targetLang) throws IOException {
        // Use Google Translate API (free, no key required)
        String urlStr = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" 
            + targetLang + "&dt=t&q=" + URLEncoder.encode(text, StandardCharsets.UTF_8);
        
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");
        
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            response.append(line);
        }
        in.close();
        
        // Parse JSON response
        JsonArray jsonArray = JsonParser.parseString(response.toString()).getAsJsonArray();
        StringBuilder translated = new StringBuilder();
        
        JsonArray translations = jsonArray.get(0).getAsJsonArray();
        for (int i = 0; i < translations.size(); i++) {
            JsonArray translation = translations.get(i).getAsJsonArray();
            translated.append(translation.get(0).getAsString());
        }
        
        return translated.toString();
    }
    
    private static TranslationProgress loadProgress(Path repoPath) {
        Path progressFile = repoPath.resolve(PROGRESS_FILE);
        if (Files.exists(progressFile)) {
            try {
                String json = Files.readString(progressFile);
                Gson gson = new Gson();
                return gson.fromJson(json, TranslationProgress.class);
            } catch (Exception e) {
                // Ignore errors, return new progress
            }
        }
        return new TranslationProgress();
    }
    
    private static void saveProgress(Path repoPath, TranslationProgress progress) {
        Path progressFile = repoPath.resolve(PROGRESS_FILE);
        try {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            String json = gson.toJson(progress);
            Files.writeString(progressFile, json);
        } catch (Exception e) {
            System.err.println("Warning: Could not save progress: " + e.getMessage());
        }
    }
}
