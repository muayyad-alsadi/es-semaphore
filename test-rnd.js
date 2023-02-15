import http from "http";
import https from "https";

import {SemaphorePromise} from "./index.js"

function http_request(url, options={}, data=null, as_string=true, should_throw=false) {
    // eslint-disable-next-line promise/avoid-new
    return new Promise(function(resolve, reject) {
        const proto = url.startsWith("https://")?https:http;
        console.log("** II ** send request: ", url);
        const req = proto.request(url, options, function(resp) {
            const {statusCode, headers} = resp;
            let data = Buffer.from("");

            // A chunk of data has been recieved.
            resp.on("data", (chunk) => {
                data = Buffer.concat([data, chunk]);
            });

            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                if (as_string) {
                    data = data.toString();
                }
                resolve([{statusCode, headers}, data]);
            });
        });
        req.on("error", (err) => {
            if (should_throw) {
                reject(err);
            } else {
                resolve([{statusCode: 0, headers: {}}, err]);
            }
        });
        if (data) {
            req.end(data, null, function() {
                // console.log("data sent");
            });
        } else {
            req.end();
        }
    });
}


async function main() {
    
    console.log("** calling HTTP API to generate random number or randomly fail:");
    const [res, data] = await http_request('https://svelte.dev/tutorial/random-number');
    console.log(data);
    console.log("** calling HTTP API 10x in parallel then Promise.all(): ...");
    let promises1=[]
    for(let i=0;i<10;++i) {
        promises1.push(http_request('https://svelte.dev/tutorial/random-number').then(([r,d])=>console.log(d)))
    }
    console.log("** await Promise.all(): ...");
    await Promise.all(promises1);
    console.log("** await Promise.all(): done.");
    console.log("** calling HTTP API 10x in parallel with a semaphore of size 5 then Promise.all(): ...");
    let promises2=[]
    const sem = new SemaphorePromise(5);
    for(let i=0;i<10;++i) {
        promises2.push(sem.with(function(){
            return http_request('https://svelte.dev/tutorial/random-number').then(([r,d])=>console.log(d))
        }));
    }
    console.log("** await Promise.all(): ...");
    await Promise.all(promises2);
    console.log("** await Promise.all(): done.");
    console.log("** all done: ...");
}

main();