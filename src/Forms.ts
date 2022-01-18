import {drop, indexBy, pluck, sum, take, uniq, uniqBy, reduceBy, map} from 'ramda'
import filter from './filter'
import request from './request'
import groupAverage from './groupAverage'
import memoize from './memoize'
const soda = require('soda-js')

const queryWithDateRange = memoize(async (url: string, dataset: string, limit = 10000, offset = 0, from, to): Promise<any[]> => new Promise((resolve, reject) => (new soda.Consumer(url)).query().withDataset(dataset).limit(limit).where(`(incident_date >= "${from}") and (incident_date <= "${to}")`).offset(offset).getRows().on('success', resolve).on('error', reject)), {
    resolver: (...args: any[]) => JSON.stringify(args)
})
const query = memoize(async (url: string, dataset: string, limit = 10000, offset = 0): Promise<any[]> => new Promise((resolve, reject) => (new soda.Consumer(url)).query().withDataset(dataset).limit(limit).offset(offset).getRows().on('success', resolve).on('error', reject)), {
    resolver: (...args: any[]) => JSON.stringify(args)
})

export type Input = {
    type: 'input',
    name: string,
} | {
    type: 'select',
    options: string[],
    name: string
} | {
    type: 'date',
    name: string
}
export type Form = {
    name: string,
    start?: boolean,
    inputs: Input[],
    defaults?: {[key: string]: any}
    output: (data: {
        [key: string]: string
    }) => any
}

function single(name: string): Input[] {
    return [{type: 'input', name}]
}


/**
 * Takes a Soda-JS Dataset and loads the entire possible range possible by iterating over the offset and limit parameters.
 * @param func The function to fetch the data
 */
const dataSetLoader = (func: (limit: number, offset: number) => Promise<any[]>) => {
    return async () => {
        let result: any[] = []
        let offset = 0
        while (true) {
            const request: any[] = await func(100000, offset)
            result = result.concat(request)
            if (request.length === 0) break
            offset += 100000
        }
        return result
    }
}

const Forms: Form[] = [
    {
        name: 'San Francisco Crime Data',
        inputs: [{type: 'date', name: 'From'}, {type: 'date', name: 'To'}],
        start: true,
        defaults: {
            From: '2020-01-01',
            To: new Date().toISOString().split('T')[0]
        },
        output: ({From, To}) => dataSetLoader((limit, offset) => queryWithDateRange('data.sfgov.org', 'wg3w-h783', limit, offset, From, To))
    },
    {
        name: 'San Francisco Fire Data',
        inputs: [{type: 'date', name: 'From'}, {type: 'date', name: 'To'}],
        start: true,
        defaults: {
            From: '2020-01-01',
            To: new Date().toISOString().split('T')[0]
        },
        output: ({From, To}) => dataSetLoader((limit, offset) => queryWithDateRange('data.sfgov.org', 'wr8u-xric', limit, offset, From, To))
    },
    {
        name: 'San Francisco Business Locations',
        inputs: [],
        start: true,
        output: () => dataSetLoader((limit, offset) => query('data.sfgov.org', 'g8m3-pdis', limit, offset))
    },
    {
        name: 'Socrata Query',
        inputs: [{name: 'URL', type: 'input'}, {name: 'ID', type: 'input'}],
        defaults: {
            URL: 'data.sfgov.org',
            ID: 'wg3w-h783'
        },
        start: true,
        output: ({URL, ID}) => dataSetLoader((limit, offset) => query(URL, ID, 100000, offset))
    },
    {
        name: 'Request',
        inputs: single('URL'),
        start: true,
        defaults: {
            URL: 'https://jsonplaceholder.typicode.com/todos'
        },
        output: ({URL}) => () => request(URL)
    },
    {
        name: 'Sample Single Data Point',
        inputs: [],
        start: true,
        output: () => () => [{point: {coordinates: [-122.38737260846696, 37.74425940578451]}}]
    },
    {
        name: 'Average',
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if (Attribute) return (arr: any[]) => sum(pluck(Attribute, arr)) / arr.length
            return (arr: any[]) => sum(arr) / arr.length
        }
    },
    {
        name: 'Pluck',
        inputs: single('Attribute'),
        output: ({Attribute}) => pluck(Attribute)
    },
    {
        name: 'Sum',
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if (Attribute) return (arr: any[]) => sum(pluck(Attribute, arr))
            return (arr: any[]) => sum(arr)
        }
    },
    {
        name: 'Limit',
        inputs: single('Count'),
        output: ({Count}) => take(+Count),
        defaults: {
            Count: 10,
        }
    },
    {
        name: 'Skip',
        inputs: single('Count'),
        output: ({Count}) => drop(+Count)
    },
    {
        name: 'Distinct',
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if(Attribute) return uniqBy((i: any) => i[Attribute])
            return uniq
        }
    },
    {
        name: 'Filter',
        inputs: [
            {
                name: 'Attribute',
                type: 'input'
            },
            {
                name: 'Operation',
                type: 'select',
                options: ['=', '!=', '<', '<=', '>', '>=']
            },
            {
                name: 'Value',
                type: 'input'
            },
        ],
        output: ({Attribute, Operation, Value}) => filter(Attribute, Value, Operation as any)
    },
    {
        name: 'Multiply By',
        inputs: single('By'),
        output: ({By}) =>
            (arr: number[] | number) => (arr && typeof arr === 'object') ? map((i) => i * +By, arr) : arr * +By
    },
    {
        name: 'Group Count',
        inputs: single('Attribute'),
        output: ({Attribute}) => reduceBy((a:number)=> a + 1, 0, (i: any)=> i[Attribute])

    },
    {
        name: 'Group Sum',
        inputs: [{type: 'input', name: 'Group'}, {type: 'input', name:'Attribute'}],
        output: ({Group, Attribute}) => reduceBy((a:number, b)=> a + b[Attribute], 0, (i: any)=> i[Group])
    },
    {
        name: 'Group Average',
        inputs: [{type: 'input', name: 'Group'}, {type: 'input', name:'Attribute'}],
        output: ({Group, Attribute}) => groupAverage(Attribute, Group)
    }
]

export default indexBy(i => i.name, Forms)
export const Names = pluck('name', Forms)
