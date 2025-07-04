export async function sleep(time: number) {
    return new Promise((resolve, reject)=> {
        setTimeout(()=> {
            resolve(true);
        },time)
    })
}