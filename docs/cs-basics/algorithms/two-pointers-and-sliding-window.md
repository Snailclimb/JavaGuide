---
title: 双指针与滑动窗口面试题总结：数组、链表、字符串高频模板
description: 双指针与滑动窗口面试题总结，讲解左右指针、快慢指针、读写指针、固定窗口、可变窗口、Java 模板和 LeetCode 高频题。
category: 计算机基础
tag:
  - 算法
head:
  - - meta
    - name: keywords
      content: 双指针,滑动窗口,快慢指针,左右指针,读写指针,固定窗口,可变窗口,数组算法,链表算法,字符串算法,LeetCode
---

双指针和滑动窗口经常放在一起复习，但它们解决的问题不完全一样。双指针更像一种移动策略，滑动窗口则强调维护一个连续区间里的状态。

一个实用判断：如果题目关心两个位置之间的关系，先想双指针；如果题目关心连续子数组或连续子串，并且窗口内有条件要维护，先想滑动窗口。

## 面试考察重点

- 能区分左右指针、快慢指针、读写指针。
- 能维护滑动窗口里的计数、和、最大值或匹配情况。
- 能解释为什么指针只向一个方向移动，时间复杂度是 `O(n)`。
- 能处理空数组、单元素、重复元素和窗口收缩边界。

## 两者到底有什么区别？

双指针是一种更宽泛的写法，只要用两个指针协作推进，都可以叫双指针。滑动窗口更具体，它维护的是一个连续区间 `[left, right]`，窗口里通常有一组状态，比如字符计数、元素和、最大值、匹配数量。

| 问题特征                            | 更可能使用 |
| ----------------------------------- | ---------- |
| 有序数组里找两个数                  | 左右指针   |
| 链表找环、找中点、找倒数第 K 个节点 | 快慢指针   |
| 原地删除或覆盖元素                  | 读写指针   |
| 连续子数组/子串的最长、最短、计数   | 滑动窗口   |

面试时先把指针含义说出来，比直接写代码更稳。比如“`left` 表示窗口左边界，`right` 表示正在尝试加入窗口的字符”，后面收缩窗口就不会乱。

## 左右指针

左右指针常用于有序数组或两端收缩问题：

```java
int[] twoSumSorted(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            return new int[] {left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return new int[] {-1, -1};
}
```

如果数组无序，通常先排序，再用左右指针。排序后要记得复杂度变成 `O(nlogn)`。

左右指针能工作的原因，是每次比较后可以排除一部分答案。以有序数组两数之和为例：

- 当前和太小，说明左指针指向的数太小，右指针再往左只会更小，所以只能左指针右移。
- 当前和太大，说明右指针指向的数太大，左指针再往右只会更大，所以只能右指针左移。

三数之和也是同一个思路，只是先固定一个数，再在剩余区间里做两数之和。难点在去重：固定数要去重，左右指针找到答案后也要跳过重复值。

## 快慢指针

快慢指针常用于链表：

```java
boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true;
        }
    }
    return false;
}
```

链表题的重点不是代码长，而是指针含义稳定。`fast != null && fast.next != null` 的顺序也不能反。

快慢指针常见有两种速度差：

- `fast` 每次走 2 步，`slow` 每次走 1 步：用于环检测和找链表中点。
- 一个指针先走 `k` 步，另一个指针再一起走：用于找倒数第 `k` 个节点。

找倒数第 `k` 个节点时，两个指针之间保持 `k` 个节点的距离。当前面的指针走到链表末尾，后面的指针刚好停在目标位置。删除倒数第 `N` 个节点时，通常会加虚拟头节点，避免删除头节点时单独处理。

## 读写指针

读写指针常用于原地修改数组：

```java
int removeDuplicates(int[] nums) {
    if (nums.length == 0) {
        return 0;
    }
    int write = 1;
    for (int read = 1; read < nums.length; read++) {
        if (nums[read] != nums[read - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }
    return write;
}
```

`read` 负责扫描原数组，`write` 指向下一个可写入位置。面试里最好先把这两个变量的含义说出来。

读写指针的核心是“读完整个数组，只把需要保留的内容写回前面”。这类题经常要求原地修改，返回新长度，而不是创建新数组。

判断写入时机时，可以问自己：当前 `read` 指向的元素是否应该保留？如果应该保留，就写到 `write`，然后 `write++`；如果不应该保留，只移动 `read`。

## 可变滑动窗口

以“无重复字符的最长子串”为例：

```java
int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0;
    int ans = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        count.put(c, count.getOrDefault(c, 0) + 1);
        while (count.get(c) > 1) {
            char d = s.charAt(left);
            count.put(d, count.get(d) - 1);
            left++;
        }
        ans = Math.max(ans, right - left + 1);
    }
    return ans;
}
```

这个模板里，右指针负责扩大窗口，左指针负责在窗口不合法时收缩。每个字符最多进窗口一次、出窗口一次，所以时间复杂度是 `O(n)`。

可变窗口一般有一个固定节奏：

1. 右指针加入新元素，更新窗口状态。
2. 当窗口不满足条件时，不断移动左指针，并同步更新状态。
3. 在窗口满足题意的位置更新答案。

最长问题和最短问题的更新时机不一样：

- 求最长合法窗口：通常在窗口恢复合法后更新答案。
- 求最短满足条件窗口：通常在窗口已经满足条件时更新答案，然后继续收缩左边界。

比如“最小覆盖子串”里，窗口一旦覆盖了目标字符，就要先更新答案，再尝试缩小窗口；“最长无重复子串”里，窗口有重复字符时要先缩到合法，再更新答案。

## 固定滑动窗口

固定窗口适合“长度为 k 的子数组/子串”：

```java
int maxSum(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) {
        window += nums[i];
    }
    int ans = window;
    for (int right = k; right < nums.length; right++) {
        window += nums[right];
        window -= nums[right - k];
        ans = Math.max(ans, window);
    }
    return ans;
}
```

固定窗口的重点是右侧进一个元素，左侧出一个元素。

固定窗口不用 `while` 收缩，因为窗口长度始终固定。它更像一个滚动统计：

- 新元素进入窗口。
- 离开窗口的旧元素被移除。
- 更新当前窗口答案。

如果窗口里还要维护最大值或最小值，普通变量不够用，通常要用单调队列。比如“滑动窗口最大值”中，队列里存可能成为最大值的下标，队首就是当前窗口最大值。

## 面试手写路径

双指针和滑动窗口题，面试里最怕指针含义写到一半变了。建议按这个顺序写：

1. 先判断题型：是两端收缩、快慢追赶、原地覆盖，还是连续窗口。
2. 明确指针含义：`left`、`right`、`slow`、`fast`、`write` 分别指向哪里。
3. 明确窗口状态：窗口内维护的是和、计数、最大值，还是匹配数量。
4. 明确移动条件：什么时候右指针扩张，什么时候左指针收缩。
5. 明确答案更新时机：合法后更新最长，满足条件时更新最短。

一句话区分最长和最短：**最长题通常先修复窗口再更新答案，最短题通常先记录答案再继续收缩。**

## 代表题精讲：最小覆盖子串

[76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/) 是滑动窗口里最能考细节的一题。题目要求在 `s` 中找到最短子串，使它覆盖 `t` 中所有字符和对应次数。

这题的关键不是会不会用窗口，而是能不能说清两个计数：

- `need`：目标字符串 `t` 里每个字符需要多少个。
- `window`：当前窗口里每个字符已经有多少个。
- `valid`：有多少种字符已经满足所需次数。

当 `valid == need.size()` 时，说明当前窗口已经覆盖 `t`，这时要更新答案，并尝试收缩左边界。

```java
String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    Map<Character, Integer> window = new HashMap<>();
    for (char c : t.toCharArray()) {
        need.put(c, need.getOrDefault(c, 0) + 1);
    }

    int left = 0;
    int valid = 0;
    int start = 0;
    int minLen = Integer.MAX_VALUE;

    for (int right = 0; right < s.length(); right++) {
        char in = s.charAt(right);
        if (need.containsKey(in)) {
            window.put(in, window.getOrDefault(in, 0) + 1);
            if (window.get(in).equals(need.get(in))) {
                valid++;
            }
        }

        while (valid == need.size()) {
            if (right - left + 1 < minLen) {
                start = left;
                minLen = right - left + 1;
            }
            char out = s.charAt(left);
            left++;
            if (need.containsKey(out)) {
                if (window.get(out).equals(need.get(out))) {
                    valid--;
                }
                window.put(out, window.get(out) - 1);
            }
        }
    }

    return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
}
```

这里有两个容易写错的点：

- `valid--` 要发生在减少 `window[out]` 之前，因为此时窗口还刚好满足条件。
- 更新答案要放在 `while (valid == need.size())` 里面，因为只有当前窗口已经覆盖 `t`，才有资格参与最短答案比较。

## 过程示意和边界样例

以“无重复字符的最长子串”为例，字符串 `abba` 的窗口变化如下：

| 右指针字符 | 加入后窗口 | 是否合法 | 左指针怎么动                          | 当前最长 |
| ---------- | ---------- | -------- | ------------------------------------- | -------- |
| `a`        | `a`        | 合法     | 不动                                  | 1        |
| `b`        | `ab`       | 合法     | 不动                                  | 2        |
| `b`        | `abb`      | 不合法   | 移走 `a` 后仍不合法，再移走第一个 `b` | 2        |
| `a`        | `ba`       | 合法     | 不动                                  | 2        |

滑动窗口建议至少检查这些边界：

| 输入                 | 重点                     |
| -------------------- | ------------------------ |
| 空字符串或空数组     | 是否直接返回 0           |
| 全部字符相同         | 左边界是否持续收缩       |
| 没有重复字符         | 答案是否能更新到整个长度 |
| 最优窗口在开头或结尾 | 更新答案的时机是否正确   |

常见错误写法：

```java
if (count.get(c) > 1) {
    left++; // 错：只移动一次不一定能恢复合法窗口
}
```

可变窗口收缩时通常要用 `while`，直到窗口重新满足条件。只移动一次，遇到 `abba`、`aaabc` 这类输入就容易错。

## 易错点

- 双指针题先明确两个指针的含义，不要边写边猜。
- 滑动窗口里，更新答案的时机要看题目问的是最长还是最短。
- 窗口收缩时，窗口内的计数、和、匹配数都要同步更新。
- 链表快慢指针要先判断 `fast` 和 `fast.next`。
- 三数之和这类题，排序后的去重要单独处理。

## 高频问题自测

- 为什么双指针题通常是 `O(n)`，而不是两层循环的 `O(n^2)`？
- 三数之和为什么需要排序？去重分别发生在哪几个位置？
- 快慢指针找链表中点时，偶数长度返回前中点还是后中点？
- 滑动窗口什么时候用 `if` 收缩，什么时候必须用 `while` 收缩？
- 最长窗口和最短窗口的答案更新时机有什么区别？

## 推荐练习题

- [26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)
- [15. 三数之和](https://leetcode.cn/problems/3sum/)
- [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)
- [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
- [76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

<!-- @include: @article-footer.snippet.md -->
