#include <iostream>
#include <array>
using namespace std;
// This function accepts an integer input and returns its respective triangular number.
int triangle_n(int n) {
    int total = 0;
    if (n <= 0) {
        return 1;
    }
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}
// This function accepts a string input and prints it backwards.
int backwards(string str) {
    for (int i = str.length()-1; i >= 0; i--) {
        cout << str[i];
    }
    return 0;
}
// This function accepts two integer inputs and returns if the first number is a multiple of the second.
bool ismultof(int n, int multiple) {
    if (n % multiple == 0) {
        return true;
    }
    return false;
}
// This function accepts a string input and a character input and returns the string wtihout the character.
string noChar(string instr, char nochar) {
    string out = "";
    for (int i = 0; i < instr.length(); i++) {
        if (!(instr[i] == nochar)) {
            out += instr[i];
        }
    }
    return out;
}
// This function accepts a string input and returns it backwards.
string reverse(string in) {
    string rev = "";
    for (int i = in.length() - 1; i >= 0; i--) {
        rev += in[i];
    }
    return rev;
}
// This function accepts a string input and returns if it is a palindrome.
bool isPalindrome(string instr) {
    string rev = reverse(instr);
    if (instr == rev) {
        return true;
    }
    else {
        return false;
    }
}
/* These functions (factorial, rfact, lfact) accepts an integer input and 
returns its factorial.*/
int factorial (int n) {
    int total = 1;
    for (int i = 1; i <= n; i++) {
        total = total * i;
    }
    return total;
}

int rfact (int n) {
    if (n == 1 || n == 0) {
        return 1;
    }
    else if (n < 0) {
        return 0;
    }
    return n * rfact(n-1);
}

int lfact (int n) {
    int inList[10000];
    inList[0] = 1;
    for (int i = 1; i <= n; i++) {
        inList[i] = inList[i-1] * (i+1);
    }
    return inList[n-1];
}
/* These functions (fib, rfib, lfib) accepts an integer input and 
returns its respective Fibbonaci number.*/
int fib(int n) {
    int n1 = 1;
    int n2 = 1;
    int next = 0;
    for (int i = 1; i <= n-2; i++) {
        next = n1 + n2;
        n1 = n2;
        n2 = next;
    }
    return next;
}

int rfib (int n) {
    if (n == 1 || n == 2) {
        return 1;
    }
    return fib(n-1) + fib(n-2);
}

int lfib (int n) {
    int inList[1000];
    inList[0] = 1;
    inList[1] = 1;
    for (int i = 2; i < n; i++) {
        inList[i] = inList[i-1] + inList[i-2];
    }
    return inList[n-1];
}
// Just the triangular numbers, solved by recursion
int rtriangle (int n) {
    if (n == 1) return 1;
    return rtriangle(n-1) + n;
}
// A^B
long long power(int a, int b) {
    if (b <= 0) return 1;
    return a * power(a, b-1);
}
// digitsum
int digitsum (int n) {
    if (n == 0) return 0;
    return n % 10 + digitsum (n / 10);
}