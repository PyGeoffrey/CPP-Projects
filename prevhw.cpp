// good number - mutiple of 3 or mutiple of 5 and less than or equal to 20
/*

#include <iostream>
using namespace std;
int main(){
    int x;
    cin >> x;
    if (x % 5 == 0) {
        cout << "TRUE";
        return 0;
    }
    if ((x % 3 == 0) && (x <= 20)) {
        cout << "TRUE";
        return 0;
    }
    cout << "FALSE";
    return 0;
}
    
*/

// using .h files
/*
#include <iostream>
#include <C:\Users\guang\Documents - Local\Coding - C++\xtramath.h>
using namespace std;
int main(){
    int a;
    cin >> a;
    cout << triangle_n(a);
}
*/
// backwards string
/*
#include <iostream>
using namespace std; 
int main() {
 string str = "); namreg ton si siht\ndesserpmi ma i siht daer nac uoy fi\negassem siht daer nac uoy fi pu sbmuht";
 for (int i = str.length()-1; i >= 0; i--) {
    cout << str[i];
 }
}
*/
// sumeven
/*
#include <iostream>
#include <array>
#include <C:\Users\guang\Documents - Local\Coding - C++\xtramath.h>
using namespace std;

int main() {
    int inList[] = {1, 2, 3, 4, 5, 6, 7, 10, 24, 1000, 10312};
    int listLen = sizeof(inList)/sizeof(inList[0]);
    int total = 0;
    for (int index = 0; index < listLen; index++) {
        if (ismultof(inList[index], 2)) {
            total += inList[index];
        }
    }
    cout << total;
}
*/
// Collatz
/*
#include <iostream>
#include <array>
using namespace std;

int main() {
  int a;
  cin >> a;
  while (a != 1) {
    if (a % 2 == 0) {
      cout << a << "/2=";
      a = a/2;
      cout << a << endl;
    }
    else {
        cout << a << "*3+1=";
        a = a*3+1;
        cout << a << endl;
    }
  }
  cout << "end";
}
*/
// earthen-fairy numbers (errors)
/*
#include <iostream>
#include <string>
#include <cstdlib>
using namespace std;

int main() {
    int n;
    int k;
    cin >> n >> k;
    int nnow = n;
    int digit = 0;
    int total = 1;
    int counter = 0;
    for (int i = 1; i <= n; i++) {
        nnow = i;
        while (nnow > 0) {
            digit = (nnow - digit) % 10;
            nnow = (nnow - digit)/10;
            total = total*digit;
        }
        if (abs(i-total) <= k) {
            counter += 1;
        }
        digit = 0;
        total = 1;
    }
    cout << counter;
}
*/
// sum of the nth number and before of some telescoping sequence 1/2, 1/6, 1/10, 1/30, ...
/*
#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    float total = 0;
    for (int i = 1; i <= n; i++) {
      int ttl = 0;
      for (int num = 1; num <= i; num++) {
        ttl += num;
      }
      total += 1.0/(2*(ttl));
    }
    int inttotal = 1000*total;
    if (inttotal % 10 < 5) {
        inttotal = inttotal - inttotal % 10;
        cout << (inttotal)/1000.0;
    }
    else {
        inttotal = inttotal - inttotal % 10;
        cout << (inttotal+10)/1000.0;
    }
}
*/
// min-max
/*
#include <iostream>
#include <list>
using namespace std;

int main() {
  int n;
  cin >> n;
  int nList[n];
  int max = 0;
  int min = 999999999;
  for (int i = 0; i < n; i++) {
    cin >> nList[i];
    if (nList[i] >= max) {
      max = nList[i];
    }
    if (nList[i] <= min) {
      min = nList[i];
    }
  }
  cout << max << endl << min;
}
*/
// sum of the odd numbers in a list
/*
#include <iostream>
using namespace std;

int main() {
    int n;
    int total = 0;
    while (cin >> n) {
        if (n % 2 == 1) {
            total += n;
        }
    }
}
*/
// the number of substrings 'XC'
/*
using namespace std;

int main() {
    string instr;
    cin >> instr;
    bool Xin;
    bool Cin;
    int counter = 0;
    for (int i = 0; i < instr.length(); i++) {
        if (instr[i] == 'X') {
            Xin = true;
        }
        if ((instr[i] == 'C') && Xin == true) {
            counter += 1;
        }
    }
    cout << counter;
}
*/
// is the bitstring the same? '*' is a wildcard.
/*
#include <iostream>
using namespace std;

int main() {
    string bitstr1;
    string bitstr2;
    cin >> bitstr1 >> bitstr2;
    for (int i = 0; i < bitstr1.length(); i++) {
        if (bitstr1[i] == '*' || bitstr2[i] == '*') {
            continue;
        }
        if (bitstr1[i] == bitstr2[i]) {
            continue;
        }
        cout << "False";
        return 0;
    }
    cout << "True";
}
*/
// Plant trees
/*
#include <iostream>
#include <C:\Users\guang\Documents - Local\Coding - C++\xtramath.h>
using namespace std;

int main() {
    int n;
    int m;
    cin >> n >> m;
    int nList[n+1];
    for (int l = 0; l <= n; l++) {
        nList[l] = 0;
    }
    for (int i = 0; i < m; i++) {
        int l;
        int r;
        cin >> l >> r;
        int counter = 0;
        for (int j = 0; j <= n; j++) {
            nList[j] = 0;
            if (j >= l && j <= r) {
                nList[j] = 1;
            }
        }
        for (int k = 0; k <= n; k++) {
            if (nList[k] == 1) {
                counter++;
            }
        }
        cout << counter << endl;
    }
}
*/
// move 1 letter up in the alphabet
/*
#include <iostream>
using namespace std;

int main () {
    string a;
    while (cin >> a) {
        char x[26] = {'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'};
        for (int i = 0; i < a.length(); i++) {
            for (int k = 0; k < 26; k++) {
                if (a[i] == x[k]) {
                    if (a[i] == 'z') {
                        cout << 'a';
                    }
                    else {
                        cout << x[k+1];
                    }
                }
            }
        }
        cout << ' ';
    }
}
*/

// HW question
/*
#include <iostream>
// #include <C:\Users\guang\Documents - Local\Coding - C++\xtramath.h>
using namespace std;

int main () {
    string n;
    cin >> n;
    string nout = "";
    string pnout;
    int nList[10000];
    for (int i = 0; i < n.length(); i++) {
        cin >> nList[i];
    }
    for (int i = 0; i < n.length(); i++) {
        for (int x = 0; x < n.length(); x++) {
            if (nList[i] == x) {
                continue;
            }
            nout += nList[i];
        }
        pnout = nout;
        nout = "";
    }
    cout << nout;
}
*/
// n/k = 0, n/k, n/(k/2), .. n/1 week 5 problem 12 course content
/*
#include <iostream>
#include <cmath>
using namespace std;

string f(int n, int k) {
    if (k == 1) return to_string(n);
    return to_string(n/k) + ' ' + f(n, k/2) ;
}

int main() {
    int n;
    cin >> n;
    int mtplr = 1;
    while (pow(2, mtplr) < n) {
        mtplr ++;
    }
    int k = pow(2, mtplr);
    cout << f(n, k);
}
*/

// merge descending ordered arrays week 5 problem 6 c++
/*
#include <iostream>
// #include <C:\Users\guang\Documents - Local\Coding - C++\xtramath.h>
#include <vector>
#include <cmath>
using namespace std;

int main() {
    vector<int> nList1;
    int incurrent;
    int i = 0;
    while (cin >> incurrent) {
        if (incurrent == -1) {
            break;
        }
        nList1.push_back(incurrent);
        int incurrent;
    }
    
    vector<int> nList2;
    incurrent = 0;
    i = 0;
    while (cin >> incurrent) {
        if (incurrent == -1) {
            break;
        }
        nList2.push_back(incurrent);
        int incurrent;
    }
    
    vector<int> mnList;
    while (nList1.size() > 0 && nList2.size() > 0) {
        if (nList1[0] > nList2[0]) {
            mnList.push_back(nList1[0]);
            nList1.erase(nList1.begin());
        }
        else {
            mnList.push_back(nList2[0]);
            nList2.erase(nList2.begin());
        }
    }
    mnList.insert(mnList.end(), nList1.begin(), nList1.end());
    mnList.insert(mnList.end(), nList2.begin(), nList2.end());
    for (int i = 0; i < mnList.size(); i++) {
        cout << mnList[i] << ' ';
    }
}
*/