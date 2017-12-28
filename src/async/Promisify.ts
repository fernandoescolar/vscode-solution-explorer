export function Promisify<T>(target: Function, args: any[]|IArguments, context?: any, resolver?: {(): T}): Promise<T> {    
    return new Promise<T>((resolve, reject) => {
        target.apply(context, Array.prototype.slice.call(args).concat([(err: Error, result: T) => {
            if (err)
                reject(err);
            else if (resolver)
                resolve(resolver.apply(context, arguments));
            else
                resolve(result);
        }]));
    });
}