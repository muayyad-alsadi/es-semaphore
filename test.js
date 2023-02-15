import {SemaphorePromise} from "./index.js"

function sleep(ms) {
    // eslint-disable-next-line promise/avoid-new
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepValue(ms, value) {
    console.log("enter: ", value);
    await sleep(ms);
    return value;
}

async function main() {
    console.log("** sleep between 50ms to 150ms then return a value and print it");
    console.log("** do that 10x then await Promise.all()");
    let promises1=[]
    for(let i=0;i<10;++i) {
        const rnd_ms = Math.round(50+Math.random()*100);
        const p=sleepValue(rnd_ms, i).then(console.log);
        promises1.push(p);
    }
    console.log("** await Promise.all(): ...");
    await Promise.all(promises1);
    console.log("** await Promise.all(): done.");
    console.log("** do that 10x with a semaphore of size 5 then await Promise.all()");
    const sem = new SemaphorePromise(5);
    let promises2=[]
    for(let i=0;i<10;++i) {
        const rnd_ms = Math.round(50+Math.random()*100);
        await sem.acquire();
        const p=sleepValue(rnd_ms, i).then(console.log).finally(()=>sem.release());
        promises2.push(p);
    }
    console.log("** await Promise.all(): ...");
    await Promise.all(promises2);
    console.log("** await Promise.all(): done.");
}

main();