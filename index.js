/**
 * SemaphorePromise class
 * @typedef {Object} SemaphorePromise
 */
export class SemaphorePromise {
    /**
     * @constructor
     * @param {number} n
     */
    constructor(n) {
        this.n = n;
        this.wait_promise = null;
        this.wait_promise_cb = null;
    }

    async acquire() {
        const self = this;
        while (self.n==0) {
            if (!self.wait_promise) {
                self.wait_promise = new Promise(function(resolve) {
                    self.wait_promise_cb = resolve;
                });
            }
            // console.log("waiting ...");
            await self.wait_promise;
            // console.log("waiting ... done");
        }
        --(self.n);
        return self.n;
    }

    release() {
        ++(this.n);
        const wait_cb = this.wait_promise_cb;
        this.wait_promise_cb = null;
        this.wait_promise = null;
        if (wait_cb) wait_cb();
    }

    /**
     * 
     * @param {*} get_promise a function that returns a promise to be wrapped
     * @returns the wrapped promise
     */
    with(get_promise) {
        const self = this;
        return self.acquire().then(()=>get_promise()).finally(()=>self.release())
    }

}
