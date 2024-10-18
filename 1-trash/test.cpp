// #include <iostream>
// using namespace std;

// void print(int start, int end);

// int main() {
//     int start = 1;
//     int end = 7;
//     int extra = 0;
//     int middle = ((start + end) / 2);
//     while (true) {
//         print(start, end);

//         char choice;
//         cout << "is album better than: " << middle << endl;
//         cin >> choice;

//         if (choice == 'y') {
//             end = middle - 1;
//             middle = ((start + end + 1) / 2);
//             // if (start >= end) {
//             //     cout << endl << start - 1 << "  is the new rank tier" << endl;
//             //     return 1;
//             // }
//             // middle = ((start + end + 1) / 2);
//             if (start > end) {
//                 cout << endl << end + 1 << " is the new rank tier" << endl;
//                 return 1;
//             }
//         } else if (choice == 'n') {
//             start = middle + 1;
//             middle = ((start + end) / 2);
//             // if (start >= end) {
//             //     cout << endl << end + 1 << " is the new rank tier" << endl;
//             //     return 1;
//             // }
//             // middle = ((start + end - 1) / 2);
//             if (start > end) {
//                 cout << endl << start << " is the new rank tier" << endl;
//                 return 1;
//             }
//         } else {
//             cout << endl << middle << " is the new rank tier" << endl;
//             return 1;
//         }

        
//     }
// }

// void print(int start, int end) {
//     cout << "tier options: ";
//     for (int i = start; i <= end; ++i) {
//         cout << i << " ";
//     }
//     cout << endl;
// }




#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

void print(vector<string> array1, vector<string> array2);
void rankTracks(int start, int size, vector<string> &array1, vector<string> &array2);

int main() {
    int lengthOfArray = 11;
    vector<string> array1 = {"1","2","3","4","5","6","7","8","9", "10", "11"};
    vector<string> array2(lengthOfArray);

    for (int j = 1; j <= ceil(log2(lengthOfArray)); ++j) {
        int size = pow(2, j);
        for (int i = 0; i < lengthOfArray; i += size) {
            rankTracks(i, size, array1, array2);
            print(array1, array2);
        }
        array1 = array2;
        vector<string> newVec(lengthOfArray);
        array2 = newVec;
    } 
}

void rankTracks(int start, int size, vector<string> &array1, vector<string> &array2) {

    int start1 = start;
    int end1 = min(start + (size / 2), (int)array1.size());
    int start2 = end1;
    int end2 = min(start + size, (int)array1.size());

    int currInd = start;
    while (start1 < end1 && start2 < end2) {
        cout << array1[start1] << " or " << array1[start2] << ":  ";
        char answer;
        cin >> answer;

        if (answer == 'f') {
            array2[currInd] = array1[start1];
            ++start1;
        } else {
            array2[currInd] = array1[start2];
            ++start2;
        }
        ++currInd;
    }

    while (start1 < end1) {
        array2[currInd] = array1[start1];
        start1++;
        currInd++;
    }
    while (start2 < end2) {
        array2[currInd] = array1[start2];
        start2++;
        currInd++;
    }
}

void print(vector<string> array1, vector<string> array2) {
    cout << "array 1: ";
    for (int i = 0; i < array1.size(); ++i) {
        cout << array1[i] << " ";
    }
    cout << endl;

    cout << "array 2: ";
    for (int i = 0; i < array2.size(); ++i) {
        cout << array2[i] << " ";
    }
    cout << endl;
}