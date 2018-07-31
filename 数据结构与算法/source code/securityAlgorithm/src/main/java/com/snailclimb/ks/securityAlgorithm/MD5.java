package com.snailclimb.ks.securityAlgorithm;

public class MD5{
    /*
    *四个链接变量
    */
    private final int A=0x67452301;
    private final int B=0xefcdab89;
    private final int C=0x98badcfe;
    private final int D=0x10325476;
    /*
    *ABCD的临时变量
    */
    private int Atemp,Btemp,Ctemp,Dtemp;
     
    /*
    *常量ti
    *公式:floor(abs(sin(i+1))×(2pow32)
    */
    private final int K[]={
        0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,
        0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,
        0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,
        0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,
        0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
        0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,
        0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,
        0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,
        0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,
        0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,
        0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,
        0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,
        0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391};
    /*
    *向左位移数,计算方法未知
    */
    private final int s[]={7,12,17,22,7,12,17,22,7,12,17,22,7,
        12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
        4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,
        15,21,6,10,15,21,6,10,15,21,6,10,15,21};
     
     
    /*
    *初始化函数
    */
    private void init(){
        Atemp=A;
        Btemp=B;
        Ctemp=C;
        Dtemp=D;
    }
    /*
    *移动一定位数
    */
    private    int    shift(int a,int s){
        return(a<<s)|(a>>>(32-s));//右移的时候，高位一定要补零，而不是补充符号位
    }
    /*
    *主循环
    */
    private void MainLoop(int M[]){
        int F,g;
        int a=Atemp;
        int b=Btemp;
        int c=Ctemp;
        int d=Dtemp;
        for(int i = 0; i < 64; i ++){
            if(i<16){
                F=(b&c)|((~b)&d);
                g=i;
            }else if(i<32){
                F=(d&b)|((~d)&c);
                g=(5*i+1)%16;
            }else if(i<48){
                F=b^c^d;
                g=(3*i+5)%16;
            }else{
                F=c^(b|(~d));
                g=(7*i)%16;
            }
            int tmp=d;
            d=c;
            c=b;
            b=b+shift(a+F+K[i]+M[g],s[i]);
            a=tmp;
        }
        Atemp=a+Atemp;
        Btemp=b+Btemp;
        Ctemp=c+Ctemp;
        Dtemp=d+Dtemp;
     
    }
    /*
    *填充函数
    *处理后应满足bits≡448(mod512),字节就是bytes≡56（mode64)
    *填充方式为先加一个0,其它位补零
    *最后加上64位的原来长度
    */
    private int[] add(String str){
        int num=((str.length()+8)/64)+1;//以512位，64个字节为一组
        int strByte[]=new int[num*16];//64/4=16，所以有16个整数
        for(int i=0;i<num*16;i++){//全部初始化0
            strByte[i]=0;
        }
        int    i;
        for(i=0;i<str.length();i++){
            strByte[i>>2]|=str.charAt(i)<<((i%4)*8);//一个整数存储四个字节，小端序
        }
        strByte[i>>2]|=0x80<<((i%4)*8);//尾部添加1
        /*
        *添加原长度，长度指位的长度，所以要乘8，然后是小端序，所以放在倒数第二个,这里长度只用了32位
        */
        strByte[num*16-2]=str.length()*8;
            return strByte;
    }
    /*
    *调用函数
    */
    public String getMD5(String source){
        init();
        int strByte[]=add(source);
        for(int i=0;i<strByte.length/16;i++){
        int num[]=new int[16];
        for(int j=0;j<16;j++){
            num[j]=strByte[i*16+j];
        }
        MainLoop(num);
        }
        return changeHex(Atemp)+changeHex(Btemp)+changeHex(Ctemp)+changeHex(Dtemp);
     
    }
    /*
    *整数变成16进制字符串
    */
    private String changeHex(int a){
        String str="";
        for(int i=0;i<4;i++){
            str+=String.format("%2s", Integer.toHexString(((a>>i*8)%(1<<8))&0xff)).replace(' ', '0');
 
        }
        return str;
    }
    /*
    *单例
    */
    private static MD5 instance;
    public static MD5 getInstance(){
        if(instance==null){
            instance=new MD5();
        }
        return instance;
    }
     
    private MD5(){};
     
    public static void main(String[] args){
        String str=MD5.getInstance().getMD5("你若安好，便是晴天");
        System.out.println(str);
    }
}