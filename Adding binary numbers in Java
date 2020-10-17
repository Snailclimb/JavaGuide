import java.util.Scanner;
public class JavaExample {
   public static void main(String[] args)
   {
	//Two variables to hold two input binary numbers	 
	long b1, b2;
	int i = 0, carry = 0;

	//This is to hold the output binary number
	int[] sum = new int[10];

	//To read the input binary numbers entered by user
	Scanner scanner = new Scanner(System.in);

	//getting first binary number from user
	System.out.print("Enter first binary number: ");
	b1 = scanner.nextLong();
	//getting second binary number from user
	System.out.print("Enter second binary number: ");
	b2 = scanner.nextLong();

	//closing scanner after use to avoid memory leak
	scanner.close();
	while (b1 != 0 || b2 != 0) 
	{
		sum[i++] = (int)((b1 % 10 + b2 % 10 + carry) % 2);
		carry = (int)((b1 % 10 + b2 % 10 + carry) / 2);
		b1 = b1 / 10;
		b2 = b2 / 10;
	}
	if (carry != 0) {
		sum[i++] = carry;
	}
	--i;
	System.out.print("Output: ");
	while (i >= 0) {
		System.out.print(sum[i--]);
	}
	System.out.print("\n");  
   }
}
