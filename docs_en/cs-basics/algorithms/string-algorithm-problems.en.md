---
title: Several common string algorithm questions
category: Computer Basics
tag:
  - Algorithm
head:
  - - meta
    - name: keywords
      content: String algorithm, KMP, BM, sliding window, substring, matching, complexity
  - - meta
    - name: description
      content: Summarizes string high-frequency algorithms and question types, focusing on KMP/BM principles, sliding windows and other techniques to help efficient matching and implementation.
---

> Author: wwwxmu
>
> Original address: <https://www.weiweiblog.cn/13string/>

## 1. KMP algorithm

When talking about string problems, we have to mention the KMP algorithm, which is used to solve the problem of string search. It can find the position where a substring (W) appears in a string (S). The KMP algorithm reduces the time complexity of character matching to O(m+n), and the space complexity is only O(m). Because the "brute force search" method will repeatedly backtrack the main string, resulting in low efficiency, the KMP algorithm can use the effective information of partial matching to keep the pointer on the main string from backtracking. By modifying the pointer of the substring, the pattern string can be moved to a valid position as much as possible.

For specific algorithm details, please refer to:

- [Understand KMP thoroughly from beginning to end:](https://blog.csdn.net/v_july_v/article/details/7041827)
- [How to better understand and master the KMP algorithm?](https://www.zhihu.com/question/21923021)
- [Detailed analysis of KMP algorithm](https://blog.sengxian.com/algorithms/kmp)
- [Illustration of KMP algorithm](http://blog.jobbole.com/76611/)
- [KMP string matching algorithm that everyone can understand [bilingual subtitles]](https://www.bilibili.com/video/av3246487/?from=search&seid=17173603269940723925)
- [KMP String Matching Algorithm 1](https://www.bilibili.com/video/av11866460?from=search&seid=12730654434238709250)

**In addition, let’s learn more about the BM algorithm! **

> The BM algorithm is also an exact string matching algorithm. It uses a right-to-left comparison method and applies two heuristic rules, namely the bad character rule and the good suffix rule, to determine the distance to jump to the right. The basic idea is to match characters from right to left. When encountering unmatched characters, find the largest right shift value from the bad character table and good suffix table, and shift the pattern string to the right to continue matching.
> "KMP Algorithm for String Matching": <http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html>

## 2. Replace spaces

> Sword-pointing offer: Please implement a function to replace each space in a string with "%20". For example, when the string is We Are Happy., the replaced string is We%20Are%20Happy.

Here I provide two methods: ① conventional method; ② use API to solve it.

```java
//https://www.weiweiblog.cn/replacespace/
public class Solution {

  /**
   * The first method: conventional method. Use String.charAt(i) and String.valueOf(char).equals(" "
   *) Traverse the string and determine whether the element is a space. If yes, replace it with "%20", otherwise do not replace it.
   */
  public static String replaceSpace(StringBuffer str) {

    int length = str.length();
    // System.out.println("length=" + length);
    StringBuffer result = new StringBuffer();
    for (int i = 0; i < length; i++) {
      char b = str.charAt(i);
      if (String.valueOf(b).equals(" ")) {
        result.append("%20");
      } else {
        result.append(b);
      }
    }
    return result.toString();

  }

  /**
   * The second method: Use API to replace all spaces and solve the problem with one line of code
   */
  public static String replaceSpace2(StringBuffer str) {

    return str.toString().replaceAll("\\s", "%20");
  }
}

```

For replacing fixed characters (such as spaces), the second method can actually use the `replace` method to replace, which has better performance!

```java
str.toString().replace(" ","%20");
```

## 3. Longest common prefix

> Leetcode: Write a function to find the longest common prefix in an array of strings. If no common prefix exists, the empty string "" is returned.

Example 1:

```plain
Input: ["flower","flow","flight"]
Output: "fl"
```

Example 2:

```plain
Input: ["dog","racecar","car"]
Output: ""
Explanation: No common prefix exists for the input.
```

The idea is very simple! First use Arrays.sort(strs) to sort the array, and then compare the characters of the first element and the last element of the array from front to back!

```java
public class Main {
 public static String replaceSpace(String[] strs) {

  //If the check value is illegal and returns an empty string
  if (!checkStrs(strs)) {
   return "";
  }
  //array length
  int len = strs.length;
  // Used to save results
  StringBuilder res = new StringBuilder();
  // Sort the elements of the string array in ascending order (if it contains numbers, the numbers will be sorted first)
  Arrays.sort(strs);
  int m = strs[0].length();
  int n = strs[len - 1].length();
  int num = Math.min(m, n);
  for (int i = 0; i < num; i++) {
   if (strs[0].charAt(i) == strs[len - 1].charAt(i)) {
    res.append(strs[0].charAt(i));
   } else
    break;

  }
  return res.toString();

 }

 private static boolean checkStrs(String[] strs) {
  boolean flag = false;
  if (strs != null) {
   // Traverse strs to check element values
   for (int i = 0; i < strs.length; i++) {
    if (strs[i] != null && strs[i].length() != 0) {
     flag = true;
    } else {
     flag = false;
     break;
    }
   }
  }
  return flag;
 }

 // test
 public static void main(String[] args) {
  String[] strs = { "customer", "car", "cat" };
  // String[] strs = { "customer", "car", null }; // Empty string
  // String[] strs = {}; // empty string
  // String[] strs = null; // empty string
  System.out.println(Main.replaceSpace(strs));// c
 }
}

```

## 4. Palindrome string

### 4.1. The longest palindrome string

> LeetCode: Given a string containing uppercase and lowercase letters, find the longest palindrome string constructed from these letters. During construction, be aware of case sensitivity. For example, `"Aa"` cannot be treated as a palindrome string. Note
> Meaning: Assume that the length of the string will not exceed 1010.
>
> Palindrome string: "Palindrome string" is a string that has the same forward and backward reading, such as "level" or "noon", etc. It is a palindrome string. ——Baidu Encyclopedia Address: <https://baike.baidu.com/item/%E5%9B%9E%E6%96%87%E4%B8%B2/1274921?fr=aladdin>

Example 1:

```plain
Input:
"abccccdd"

Output:
7

Explanation:
The longest palindrome we can construct is "dccaccd", which has a length of 7.```

We already know above what is a palindrome string? Now let's consider two situations in which a palindrome can be formed:

- A combination of characters appearing an even number of times
- **A combination of characters with an even number of occurrences + the character with the most odd number of occurrences in a single character** (see **[issue665](https://github.com/Snailclimb/JavaGuide/issues/665)** )

Just count the number of times characters appear, and even numbers can constitute a palindrome. Because the middle number is allowed to appear alone, such as "abcba", if there is a single letter at the end, the total length can be increased by 1. First convert the string into a character array. Then iterate through the array to determine whether the corresponding character is in the hashset. If it is not there, add it. If it is there, count++, and then remove the character! This way you can find the number of characters with an even number of occurrences.

```java
//https://leetcode-cn.com/problems/longest-palindrome/description/
class Solution {
  public int longestPalindrome(String s) {
    if (s.length() == 0)
      return 0;
    // used to store characters
    HashSet<Character> hashset = new HashSet<Character>();
    char[] chars = s.toCharArray();
    int count = 0;
    for (int i = 0; i < chars.length; i++) {
      if (!hashset.contains(chars[i])) {// If the hashset does not have the character, save it
        hashset.add(chars[i]);
      } else {// If there is, let count++ (indicating that a paired character is found), and then remove the character
        hashset.remove(chars[i]);
        count++;
      }
    }
    return hashset.isEmpty() ? count * 2 : count * 2 + 1;
  }
}
```

### 4.2. Verify palindrome string

> LeetCode: Given a string, verify whether it is a palindrome string. Only alphabetic and numeric characters are considered, and the case of letters can be ignored. Note: In this question, we define the empty string as a valid palindrome string.

Example 1:

```plain
Input: "A man, a plan, a canal: Panama"
Output: true
```

Example 2:

```plain
Input: "race a car"
Output: false
```

```java
//https://leetcode-cn.com/problems/valid-palindrome/description/
class Solution {
  public boolean isPalindrome(String s) {
    if (s.length() == 0)
      return true;
    int l = 0, r = s.length() - 1;
    while (l < r) {
      //Traverse from the beginning and the end to the middle
      if (!Character.isLetterOrDigit(s.charAt(l))) {// Characters are not letters and numbers
        l++;
      } else if (!Character.isLetterOrDigit(s.charAt(r))) {// Characters are not letters and numbers
        r--;
      } else {
        // Determine whether the two are equal
        if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r)))
          return false;
        l++;
        r--;
      }
    }
    return true;
  }
}
```

### 4.3. The longest palindrome substring

> Leetcode: LeetCode: Longest Palindrome Substring Given a string s, find the longest palindrome substring in s. You can assume that the maximum length of s is 1000.

Example 1:

```plain
Input: "babad"
Output: "bab"
Note: "aba" is also a valid answer.
```

Example 2:

```plain
Input: "cbbd"
Output: "bb"
```

Taking a certain element as the center, calculate the maximum length of the even-length palindrome and the maximum length of the odd-length palindrome respectively.

```java
//https://leetcode-cn.com/problems/longest-palindromic-substring/description/
class Solution {
  private int index, len;

  public String longestPalindrome(String s) {
    if (s.length() < 2)
      return s;
    for (int i = 0; i < s.length() - 1; i++) {
      PalindromeHelper(s, i, i);
      PalindromeHelper(s, i, i + 1);
    }
    return s.substring(index, index + len);
  }

  public void PalindromeHelper(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
      l--;
      r++;
    }
    if (len < r - l - 1) {
      index = l + 1;
      len = r - l - 1;
    }
  }
}
```

### 4.4. The longest palindrome subsequence

> LeetCode: longest palindrome subsequence
> Given a string s, find the longest palindrome subsequence in it. We can assume that the maximum length of s is 1000.
> **The difference between the longest palindrome subsequence and the longest palindrome substring of the previous question is that a substring is a continuous sequence in a string, while a subsequence is a character sequence that maintains a relative position in the string. For example, "bbbb" can be a subsequence of the string "bbbab" but not a substring. **

Given a string s, find the longest palindrome subsequence in it. We can assume that the maximum length of s is 1000.

Example 1:

```plain
Input:
"bbbab"
Output:
4
```

The longest possible palindromic subsequence is "bbbb".

Example 2:

```plain
Input:
"cbbd"
Output:
2
```

The longest possible palindromic subsequence is "bb".

**Dynamic programming:** `dp[i][j] = dp[i+1][j-1] + 2 if s.charAt(i) == s.charAt(j) otherwise, dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1])`

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int len = s.length();
        int [][] dp = new int[len][len];
        for(int i = len - 1; i>=0; i--){
            dp[i][i] = 1;
            for(int j = i+1; j < len; j++){
                if(s.charAt(i) == s.charAt(j))
                    dp[i][j] = dp[i+1][j-1] + 2;
                else
                    dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
            }
        }
        return dp[0][len-1];
    }
}
```

## 5. Bracket matching depth

> iQIYI 2018 Autumn Recruitment Java:
> A valid bracket matching sequence is defined as follows:
>
> 1. The empty string "" is a legal bracket matching sequence
> 2. If "X" and "Y" are both legal bracket matching sequences, "XY" is also a legal bracket matching sequence.
> 3. If "X" is a legal bracket matching sequence, then "(X)" is also a legal bracket matching sequence
> 4. Every legal bracket sequence can be generated by the above rules.
>
> For example: "","()","()()","((()))" are all legal bracket sequences
> For a legal bracket sequence we have the following definition of its depth:
>
> 1. The depth of the empty string "" is 0
> 2. If the depth of string "X" is x and the depth of string "Y" is y, then the depth of string "XY" is max(x,y)> 3. If the depth of "X" is x, then the depth of the string "(X)" is x+1
>
> For example: "()()()" has a depth of 1, "((()))" has a depth of 3. Niuniu now gives you a legal bracket sequence, and you need to calculate its depth.

```plain
Enter description:
The input includes a legal bracket sequence s, the length of s is length (2 ≤ length ≤ 50), and the sequence only contains '(' and ')'.

Output description:
Output a positive integer, which is the depth of this sequence.
```

Example:

```plain
Input:
(())
Output:
2
```

The code is as follows:

```java
import java.util.Scanner;

/**
 * https://www.nowcoder.com/test/8246651/summary
 *
 * @author Snailclimb
 * @date September 6, 2018
 * @Description: TODO Find the depth of a given legal bracket sequence
 */
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String s = sc.nextLine();
    int cnt = 0, max = 0, i;
    for (i = 0; i < s.length(); ++i) {
      if (s.charAt(i) == '(')
        cnt++;
      else
        cnt--;
      max = Math.max(max, cnt);
    }
    sc.close();
    System.out.println(max);
  }
}

```

## 6. Convert string to integer

> Jianzhi offer: Convert a string into an integer (implement the function of Integer.valueOf(string), but return 0 when the string does not meet the numerical requirements). It is required that the library function for converting a string into an integer cannot be used. If the value is 0 or the string is not a legal value, 0 is returned.

```java
//https://www.weiweiblog.cn/strtoint/
public class Main {

  public static int StrToInt(String str) {
    if (str.length() == 0)
      return 0;
    char[] chars = str.toCharArray();
    // Determine whether there is a sign bit
    int flag = 0;
    if (chars[0] == '+')
      flag = 1;
    else if (chars[0] == '-')
      flag = 2;
    int start = flag > 0 ? 1 : 0;
    int res = 0;//Save the result
    for (int i = start; i < chars.length; i++) {
      if (Character.isDigit(chars[i])) {// Call the Character.isDigit(char) method to determine whether it is a number, and return True if it is, otherwise False
        int temp = chars[i] - '0';
        res = res * 10 + temp;
      } else {
        return 0;
      }
    }
   return flag != 2 ? res : -res;

  }

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    String s = "-12312312";
    System.out.println("Use library function to convert: " + Integer.valueOf(s));
    int res = Main.StrToInt(s);
    System.out.println("Use your own method to convert: " + res);

  }

}

```

<!-- @include: @article-footer.snippet.md -->