package com.gpcoder.junit.util;
import org.junit.Assert;
import org.junit.Test;
public class solveNQueensTest {
     public void dfsTest() {
      List<List<String>> resultList = new LinkedList<>();
      final int[] expected = [2, 4, 6, 8, 3, 1, 7, 5];
      final int[] result = new int[8];
      dfs(resultList, result, 0, 8);
      Assert.assertArrayEquals(expected, result);
     }
     public void dfsTest2() {
      List<List<String>> resultList = new LinkedList<>();
      final int[] expected = [2, 4, 1, 3];
      final int[] result = new int[4];
      dfs(resultList, result, 0, 4);
      Assert.assertArrayEquals(expected, result);
     }
      public void dfsTest3() {
      List<List<String>> resultList = new LinkedList<>();
      final int[] expected = [];
      final int[] result = new int[3];
      dfs(resultList, result, 0, 3);
      Assert.assertArrayEquals(expected, result);
     }
}
