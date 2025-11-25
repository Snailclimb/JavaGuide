---
title: Summary of sensitive word filtering solutions
category: system design
tag:
  - safe
---

The system needs to filter the text entered by the user for sensitive words such as pornography, politics, and violence-related words.

Sensitive word filtering uses the more commonly used **Trie tree algorithm** and **DFA algorithm**.

## Algorithm implementation

### Trie tree

**Trie tree** is also known as dictionary tree and word search tree. It is a variant of hash tree and is usually used for string matching to solve the problem of quickly finding a string in a set of strings. Keyword hints for browser searches can be based on Trie trees.

![Browser Trie tree effect display](https://oss.javaguide.cn/github/javaguide/system-design/security/brower-trie.png)

Suppose there are the following sensitive words in our sensitive vocabulary:

- HD video
- HD CV
-Tokyo cold
- Tokyo Fever

The sensitive word Trie tree we constructed is as follows:

![Sensitive word Trie tree](https://oss.javaguide.cn/github/javaguide/system-design/security/sensitive-word-trie.png)

When we want to find the corresponding string "Tokyo Hot", we will cut the string into individual characters "东", "京", and "热", and then we will start matching from the root node of the Trie tree.

It can be seen that the core principle of the **Trie tree is actually very simple, which is to improve the string matching efficiency through common prefixes. **

[Apache Commons Collections](https://mvnrepository.com/artifact/org.apache.commons/commons-collections4) This library has a Trie tree implementation:

![Trie tree implementation in Apache Commons Collections](https://oss.javaguide.cn/github/javaguide/system-design/security/common-collections-trie.png)

```java
Trie<String, String> trie = new PatriciaTrie<>();
trie.put("Abigail", "student");
trie.put("Abi", "doctor");
trie.put("Annabel", "teacher");
trie.put("Christina", "student");
trie.put("Chris", "doctor");
Assertions.assertTrue(trie.containsKey("Abigail"));
assertEquals("{Abi=doctor, Abigail=student}", trie.prefixMap("Abi").toString());
assertEquals("{Chris=doctor, Christina=student}", trie.prefixMap("Chr").toString());
```

Trie tree is a data structure that uses space for time, and it takes up a lot of memory. It is for this reason that improved versions of Trie trees such as Double-Array Trie (DAT) are used in actual engineering projects.

The designers of DAT are Aoe Jun-ichi, Mori Akira and Sato Takuya from Japan. They published a paper ["An Efficient Implementation of Trie Structures"] (https://www.co-ding.com/assets/pdf/dat.pdf) in 1989, which introduced DAT in detail For the construction and application, the sample code address written by the original author: <https://github.com/komiya-atsushi/darts-java/blob/e2986a55e648296cc0a6244ae4a2e457cd89fb82/src/main/java/darts/DoubleArrayTrie.java>. Compared with the Trie tree, the memory usage of DAT is very low, reaching about 1% of the memory of the Trie tree. DAT is widely used in Chinese word segmentation, natural language processing, information retrieval and other fields, and is a very excellent data structure.

### AC automaton

Aho-Corasick (AC) automaton is an improved algorithm based on a Trie tree. It is a multi-pattern matching algorithm invented by Bell Labs researchers Alfred V. Aho and Margaret J.Corasick.

The AC automaton algorithm uses a Trie tree to store the prefix of the pattern string, and uses a failed matching pointer (mismatch pointer) to handle jumps that fail to match. For a detailed introduction to AC automata, you can view this article: [Ten minutes on the subway | AC automaton](https://zhuanlan.zhihu.com/p/146369212).

If you use the DAT mentioned above to represent the AC automaton, you can take into account the advantages of both and obtain an efficient multi-pattern matching algorithm. There is an open source Java implementation version on Github: <https://github.com/hankcs/AhoCorasickDoubleArrayTrie>.

### DFA

**DFA** (Deterministic Finite Automata) is a deterministic finite automaton, and its counterpart is NFA (Non-Deterministic Finite Automata, an uncertain finite automaton).

For a detailed introduction to DFA, you can read this article: [Finite Automata DFA&NFA (Study Notes) - Little Snail's Article - Zhihu](https://zhuanlan.zhihu.com/p/30009083).

[Hutool](https://hutool.cn/docs/#/dfa/%E6%A6%82%E8%BF%B0) provides the implementation of the DFA algorithm:

![Hutool’s DFA algorithm](https://oss.javaguide.cn/github/javaguide/system-design/security/hutool-dfa.png)

```java
WordTree wordTree = new WordTree();
wordTree.addWord("big");
wordTree.addWord("Dahanhan");
wordTree.addWord("HanHan");
String text = "That guy is really a fool!";
// Get the first matching keyword
String matchStr = wordTree.match(text);
System.out.println(matchStr);
// Standard matching, matches the shortest keyword and skips already matched keywords
List<String> matchStrList = wordTree.matchAll(text, -1, false, false);
System.out.println(matchStrList);
// Match the longest keyword and skip the already matched keywords
List<String> matchStrList2 = wordTree.matchAll(text, -1, false, true);
System.out.println(matchStrList2);
```

Output:

```plain
Big
[big, silly]
[big, big hanhan]
```

## Open source projects

- [ToolGood.Words](https://github.com/toolgood/ToolGood.Words): A high-performance sensitive word (illegal word/dirty word) detection and filtering component, with Traditional and Simplified Chinese interchange, supporting full-width and half-width interchange, Chinese character conversion to Pinyin, fuzzy search and other functions.
- [sensitive-words-filter](https://github.com/hooj0/sensitive-words-filter): Sensitive word filtering project, providing TTMP, DFA, DAT, hash bucket, and Tire algorithms to support filtering. Interface support that can support text highlighting, filtering, word judgment, and replacement.

## Paper

- [A sensitive word automatic filtering management system](https://patents.google.com/patent/CN101964000B)
- [A method and system for filtering sensitive words in online games](https://patents.google.com/patent/CN103714160A/zh)

<!-- @include: @article-footer.snippet.md -->