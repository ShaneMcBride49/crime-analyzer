import {reduceBy, map, curry} from 'ramda'


const groupAverage = curry((attribute: string, group: string, arr: any[]): number =>
    // @ts-ignore
    map(averager, reduceBy(
        (a, b) => ({count: a.count + 1, sum: a.sum + b[attribute]}),
        {count: 0, sum: 0},
        (i: any) => i[group],
        arr
    ))
)
const averager = ({sum, count}: {sum: number, count: number}) => sum / count

export default groupAverage
