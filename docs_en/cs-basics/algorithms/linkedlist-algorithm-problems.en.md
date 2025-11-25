---
title: Several common linked list algorithm questions
category: Computer Basics
tag:
  - Algorithm
head:
  - - meta
    - name: keywords
      content: Linked list algorithm, adding two numbers, reversing linked lists, ring detection, merging linked lists, complexity analysis
  - - meta
    - name: description
      content: Selected ideas and implementation of high-frequency linked list questions, covering scenarios such as adding two numbers, reversing, and ring detection, emphasizing boundary processing and complexity analysis.
---

<!-- markdownlint-disable MD024 -->

## 1. Add two numbers

### Title description

> Leetcode: Given two non-empty linked lists to represent two non-negative integers. Digits are stored in reverse order, and each of their nodes stores only a single digit. Add two numbers and return a new linked list.
>
> You can assume that except for the number 0, neither number will start with a zero.

Example:

```plain
Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
Output: 7 -> 0 -> 8
Reason: 342 + 465 = 807
```

### Problem analysis

Leetcode official detailed answer address:

<https://leetcode-cn.com/problems/add-two-numbers/solution/>

> When operating on the head node, consider creating a dummy node dummy, and use dummy->next to represent the real head node. This avoids dealing with boundary issues where the head node is empty.

We use variables to track carry and simulate carry-by starting from the head of the table containing the least significant bit
The process of bit addition.

![Figure 1, visualization of the method of adding two numbers: 342 + 465 = 807, each node contains a number, and the numbers are stored in reverse bit order. ](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/34910956.jpg)

### Solution

**We start adding from the least significant bit, which is the head of the lists l1 and l2. Note that carry needs to be considered! **

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 * int val;
 * ListNode next;
 * ListNode(int x) { val = x; }
 * }
 */
 //https://leetcode-cn.com/problems/add-two-numbers/description/
class Solution {
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummyHead = new ListNode(0);
    ListNode p = l1, q = l2, curr = dummyHead;
    //carry represents the carry number
    int carry = 0;
    while (p != null || q != null) {
        int x = (p != null) ? p.val : 0;
        int y = (q != null) ? q.val : 0;
        int sum = carry + x + y;
        //carry number
        carry = sum / 10;
        //The value of the new node is sum % 10
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        if (p != null) p = p.next;
        if (q != null) q = q.next;
    }
    if (carry > 0) {
        curr.next = new ListNode(carry);
    }
    return dummyHead.next;
}
}
```

## 2. Flip the linked list

### Title description

> Jianzhi offer: Input a linked list, after reversing the linked list, output all elements of the linked list.

![Flip linked list](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/81431871.jpg)

### Problem analysis

This algorithm question, to put it bluntly, is: how to make the next node point to the previous node! A next node is defined in the following code. This node is mainly used to save the node to be reversed to the beginning to prevent the linked list from "breaking".

### Solution

```java
public class ListNode {
  int val;
  ListNode next = null;

  ListNode(int val) {
    this.val = val;
  }
}
```

```java
/**
 *
 * @author Snailclimb
 * @date September 19, 2018
 * @Description: TODO
 */
public class Solution {

  public ListNode ReverseList(ListNode head) {

    ListNode next = null;
    ListNode pre = null;

    while (head != null) {
      //Save the node to be reversed to the beginning
      next = head.next;
      //The node to be reversed points to the previous node that has been reversed (note: it will point to null when reversed for the first time)
      head.next = pre;
      //The previous node that has been reversed to the head
      pre = head;
      // Go all the way to the end of the linked list
      head = next;
    }
    return pre;
  }

}
```

Test method:

```java
  public static void main(String[] args) {

    ListNode a = new ListNode(1);
    ListNode b = new ListNode(2);
    ListNode c = new ListNode(3);
    ListNode d = new ListNode(4);
    ListNode e = new ListNode(5);
    a.next = b;
    b.next = c;
    c.next = d;
    d.next = e;
    new Solution().ReverseList(a);
    while (e != null) {
      System.out.println(e.val);
      e = e.next;
    }
  }
```

Output:

```plain
5
4
3
2
1
```

## 3. The k-th node from the last in the linked list

### Title description

> Sword-finger offer: Input a linked list and output the k-th node from the last in the linked list.

### Problem analysis

> **The k-th node from the last in the linked list is also the positive (L-K+1) node. If you only know a little bit, this question is basically no problem! **

First, there are two nodes/pointers. One node node1 starts running first. After the pointer node1 reaches k-1 nodes, the other node node2 starts running. When node1 reaches the end, the node pointed by node2 is the k-th node from the bottom, which is the positive (L-K+1) node.

### Solution

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/

// Time complexity O(n), just one traversal
// https://www.nowcoder.com/practice/529d3ae5a407492994ad2a246518148a?tpId=13&tqId=11167&tPage=1&rp=1&ru=/ta/coding-interviews&qru=/ta/coding-interviews/question-ranking
public class Solution {
  public ListNode FindKthToTail(ListNode head, int k) {
    // If the linked list is empty or k is less than or equal to 0
    if (head == null || k <= 0) {
      return null;
    }
    // Declare two nodes pointing to the head node
    ListNode node1 = head, node2 = head;
    //Record the number of nodes
    int count = 0;
    //Record the k value, which will be used later
    int index = k;
    // The p pointer runs first and records the number of nodes. When the node1 node runs k-1 nodes, the node2 node starts running.
    // When the node1 node reaches the end, the node pointed by the node2 node is the k-th node from the bottom
    while (node1 != null) {
      node1 = node1.next;
      count++;
      if (k < 1) {
        node2 = node2.next;
      }
      k--;
    }
    // If the number of nodes is less than the required k-th node from the last, return empty
    if (count < index)
      return null;
    return node2;

  }
}```

## 4. Delete the Nth node from the bottom of the linked list

> Leetcode: Given a linked list, delete the nth node from the bottom of the linked list and return the head node of the linked list.

**Example:**

```plain
Given a linked list: 1->2->3->4->5, and n = 2.

When the penultimate node is deleted, the linked list becomes 1->2->3->5.

```

**Description:**

The given n is guaranteed to be valid.

**Advanced:**

Could you try using a one-pass scan implementation?

This question has a detailed answer on leetcode. For details, please refer to Leetcode.

### Problem analysis

We note that this problem can be easily reduced to another problem: delete the (L - n + 1)th node from the beginning of the list, where L is the length of the list. This problem is easy to solve as long as we find the length L of the list.

![Figure 1. Delete the L - n + 1 element in the list](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/94354387.jpg)

### Solution

**Two traversal method**

First we will add a **dumb node** as an auxiliary node at the head of the list. Dummy nodes are used to simplify some corner cases, such as the list containing only one node, or the head of the list needing to be deleted. In the first pass, we find the length L of the list. Then set a pointer to the dummy node and move it through the list until it reaches the (L - n)th node. **We relink the next pointer of the (L - n)th node to the (L - n + 2)th node to complete this algorithm. **

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 * int val;
 * ListNode next;
 * ListNode(int x) { val = x; }
 * }
 */
// https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/description/
public class Solution {
  public ListNode removeNthFromEnd(ListNode head, int n) {
    // Dumb nodes are used to simplify some extreme situations, such as the list containing only one node, or the head of the list that needs to be deleted.
    ListNode dummy = new ListNode(0);
    // The dumb node points to the head node
    dummy.next = head;
    //Save the length of the linked list
    int length = 0;
    ListNode len = head;
    while (len != null) {
      length++;
      len = len.next;
    }
    length = length - n;
    ListNode target = dummy;
    // Find the node at position L-n
    while (length > 0) {
      target = target.next;
      length--;
    }
    //Relink the next pointer of the (L - n)th node to the (L - n + 2)th node
    target.next = target.next.next;
    return dummy.next;
  }
}
```

**Advanced - One-time traversal method:**

> The penultimate N node in the linked list is also the positive (L - n + 1) node.

In fact, this method is the same as the idea used in our fourth question above to find "the k-th node from the last in the linked list". **The basic idea is:** Define two nodes node1 and node2; the node1 node runs first, and when the node1 node reaches the n+1th node, the node2 node starts to run. When the node1 node runs to the last node, the location of the node2 node is the (L-n)th node (L represents the total linked list length, which is the n+1th node from the bottom)

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 * int val;
 * ListNode next;
 * ListNode(int x) { val = x; }
 * }
 */
public class Solution {
  public ListNode removeNthFromEnd(ListNode head, int n) {

    ListNode dummy = new ListNode(0);
    dummy.next = head;
    // Declare two nodes pointing to the head node
    ListNode node1 = dummy, node2 = dummy;

    // The node1 node runs first. When the node1 node reaches the nth node, the node2 node starts running.
    // When the node1 node reaches the last node, the location of the node2 node is the (L-n)th node, which is the n+1th from the bottom (L represents the total linked list length)
    while (node1 != null) {
      node1 = node1.next;
      if (n < 1 && node1 != null) {
        node2 = node2.next;
      }
      n--;
    }

    node2.next = node2.next.next;

    return dummy.next;

  }
}
```

## 5. Merge two sorted linked lists

### Title description

> Sword finger offer: Input two monotonically increasing linked lists, and output the combined linked list of the two linked lists. Of course, we need the combined linked list to satisfy the monotonically non-decreasing rule.

### Problem analysis

We can analyze it like this:

1. Suppose we have two linked lists A and B;
2. Compare the value of A's head node A1 with the value of B's head node B1. If A1 is small, then A1 is the head node;
3. A2 is compared with B1. Assuming B1 is small, then A1 points to B1;
4. A2 is compared with B2
   Just keep repeating it like this, it should be fairly easy to understand.

Consider implementing it recursively!

### Solution

**Recursive version:**

```java
/*
public class ListNode {
    int val;
    ListNode next = null;

    ListNode(int val) {
        this.val = val;
    }
}*/
//https://www.nowcoder.com/practice/d8b6b4358f774294a89de2a6ac4d9337?tpId=13&tqId=11169&tPage=1&rp=1&ru=/ta/coding-interviews&qru=/ta/coding-interviews/question-ranking
public class Solution {
  public ListNode Merge(ListNode list1, ListNode list2) {
    if (list1 == null) {
      return list2;
    }
    if (list2 == null) {
      return list1;
    }
    if (list1.val <= list2.val) {
      list1.next = Merge(list1.next, list2);
      return list1;
    } else {
      list2.next = Merge(list1, list2.next);
      return list2;
    }
  }
}
```

<!-- @include: @article-footer.snippet.md -->