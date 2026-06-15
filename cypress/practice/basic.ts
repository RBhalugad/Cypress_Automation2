const flag: boolean = true;

if (flag) {
    console.log('conditions satisfied');
} else {
    console.log('conditions not satisfied');
}

let i = 0;
while (i < 10) {
    i++;
    console.log(`i am inside loop: ${i}`);
}

let j = 0;
do {
    j++;
} while (j > 10);
console.log(`i am do-while loop: ${j}`);
