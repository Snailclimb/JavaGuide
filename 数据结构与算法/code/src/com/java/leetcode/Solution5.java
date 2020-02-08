package com.java.leetcode;

class Solution5 {
    public static void main(String[] args){
        Solution5 solution5 = new Solution5();
        String s = "";
        String s1 = "babad";
        String s2 = "cbbd";
        System.out.println(solution5.longestPalindrome(s));
        System.out.println(solution5.longestPalindrome(s1));
        System.out.println(solution5.longestPalindrome(s2));
    }

    /***
     *  
     * @param s
     * @return
     */

    public String longestPalindrome(String s) {
        if(s.isEmpty()){
            return "";
        }
        int left = 0;
        int right = 0;
        int maxLen = 0;
        boolean[][] dp = new boolean[s.length()][s.length()];
        for(int i = 0; i < s.length(); i++){
            dp[i][i] = true;
        }
        for(int j = 1; j < s.length(); j++){
            for(int i = 0; i < j; i++){
                if(s.charAt(i) == s.charAt(j)){
                    if(j - i > 2){
                        dp[i][j] = dp[i + 1][j - 1];
                    }else{
                        dp[i][j] = true;
                    }
                }else{
                    dp[i][j] = false;
                }

                if(dp[i][j]){
                    int tmpLen = j - i + 1;
                    if(tmpLen > maxLen){
                        maxLen = tmpLen;
                        left = i;
                        right = j;
                    }
                }
            }
        }
        return s.substring(left, right + 1);
    }
}