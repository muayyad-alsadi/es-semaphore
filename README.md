# es-semaphore - Async Semaphore for ECMAScript / Node / Browser

## Background

As [Semaphores](https://man7.org/linux/man-pages/man7/sem_overview.7.html) are important to coordinate threads.
This node module gives you a similar feature for your async tasks.

A Semaphore indicates available resources to a given capacity.
When this limit is reached, it will sleep until a resource is free.

Think of it like a sound card with limited number of channels,
let's say 8 channels, in this case we have a semaphore of size 8,
when a process acquire it, there will be 7 free resources available
when another process acquire it, there will be 6 free resources available.
When all resources are taken the trial to acquire it will sleep until it's available.

# Usage

If you have an async generator or you have a producer that generates many tasks
and you want a cheap way to limit how many pending tasks

```javascript
import {SemaphorePromise} from "@alsadi/semaphore";
// indicate that we can have 5 pending tasks
// 5 resources can be allocated without sleep
const sem = new SemaphorePromise(5);
async function main() {
    // ...
    await sem.acquire(); // this will return directly or sleep until resource is available
    const wrapped_promise=myasync_task().then(console.log).finally(()=>sem.release()); // when done a resource is available again
    // ...
}
```

you can use `sem.with(...)` to do `acquire()` and `release()` automatically.
`sem.with(...)` takes a function that returns the promise

```javascript
import {SemaphorePromise} from "@alsadi/semaphore";
// indicate that we can have 5 pending tasks
// 5 resources can be allocated without sleep
const sem = new SemaphorePromise(5);
async function main() {
    // ...
    const wrapped_promise = sem.with(function(){
        return myasync_task().then(console.log)
    });
    // ...
}
```

You can use this inside async generators


```javascript
async function *mygen() {
    while(something()) {
        yield sem.with(function(){
            return myasync_task().then(console.log)
        });
    }
}
```


## Implementation

This implementation only uses an integer counter and a Promise with a callback
Other than that it's zero cost. It does not have busy loops or arbtrary sleeps.
The size of the semaphore does not affect its cost.


