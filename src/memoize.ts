export default function memoize <T extends (...args: any[]) => any> (func: T, {
    createCache = () => new Map(),
    resolver = (...args: any[]) => args[0]
}: {
    createCache?: (...args: any[]) => ({
        has: (key: any) => boolean,
        get: (key: any) => any,
        set: (key: any, value: any) => void
    }),
    resolver?: (...args: any[]) => any
} = {}) {
    const cache = createCache()
    return (...args: Parameters<T>) => {
        const key = resolver(...args)
        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>
        }
        const result = func(...args)
        cache.set(key, result)
        return result as ReturnType<T>
    }
}
