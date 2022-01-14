import {drop, indexBy, pluck, sum, take, uniq, uniqBy, reduceBy, equals, prop, map} from 'ramda';
import filter from './filter';
import request from './request';
import groupAverage from './groupAverage';
import memoize from './memoize';
const soda = require('soda-js');

const query = memoize(async (url: string, dataset: string, limit = 10000, offset = 0) => new Promise((resolve, reject) => (new soda.Consumer(url)).query().withDataset(dataset).limit(limit).offset(offset).getRows().on('success', resolve).on('error', reject)), {
    resolver: (...args: any[]) => JSON.stringify(args)
});


export type Input = {
    type: 'input',
    name: string,
} | {
    type: 'select',
    options: string[],
    name: string
}
export type Form = {
    name: string,
    start?: boolean,
    inputs: Input[],
    output: (data: {
        [key: string]: string
    }) => any
}

function single(name: string): Input[] {
    return [{type: 'input', name}];
}


const Forms: Form[] = [
    {
        name: "Average",
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if (Attribute) return (arr: any[]) => sum(pluck(Attribute, arr)) / arr.length;
            return (arr: any[]) => sum(arr) / arr.length;
        }
    },
    {
        name: "Pluck",
        inputs: single('Attribute'),
        output: ({Attribute}) => pluck(Attribute)
    },
    {
        name: "Sum",
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if (Attribute) return (arr: any[]) => sum(pluck(Attribute, arr));
            return (arr: any[]) => sum(arr);
        }
    },
    {
        name: "Limit",
        inputs: single('Count'),
        output: ({Count}) => take(+Count)
    },
    {
        name: "Skip",
        inputs: single('Count'),
        output: ({Count}) => drop(+Count)
    },
    {
        name: "Distinct",
        inputs: single('Attribute'),
        output: ({Attribute}) => {
            if(Attribute) return uniqBy((i: any) => i[Attribute])
            return uniq;
        }
    },
    {
        name: "Filter",
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
        name: "MultiplyBy",
        inputs: single('By'),
        output: ({By}) =>
            (arr: number[] | number) => (arr && typeof arr === 'object') ? map((i) => i * +By, arr) : arr * +By
    },
    {
        name: "Request",
        inputs: single('URL'),
        start: true,
        output: ({URL='https://jsonplaceholder.typicode.com/todos'}) => () => request(URL)
    },
    {
        name: "San Francisco Crime Data",
        inputs: [],
        start: true,
        output: ({URL='https://jsonplaceholder.typicode.com/todos'}) => memoize(async () => {

            // let consumer = new soda.Consumer('data.sfgov.org');
            // let data = await new Promise((resolve, reject) => {
            //     consumer.query().withDataset('wg3w-h783').limit(1000).getRows().on('success', resolve).on('error', reject)
            // })
            let result: any[] = [];
            let offset = 0;
            while (true) {
                const request = await query('data.sfgov.org', 'wg3w-h783', 100000, offset);
                // @ts-ignore
                result = result.concat(request);
                // @ts-ignore
                if (request.length===0) {
                    break;
                }
                offset+=100000;
            }
            return result;
        })
    },
    {
        name: "Group Count",
        inputs: single('Attribute'),
        output: ({Attribute}) => reduceBy((a:number)=> a + 1, 0, (i: any)=> i[Attribute])

    },
    {
        name: "Group Sum",
        inputs: [{type: 'input', name: 'Group'}, {type: 'input', name:'Attribute'}],
        output: ({Group, Attribute}) => reduceBy((a:number, b)=> a + b[Attribute], 0, (i: any)=> i[Group])
    },
    {
        name: "Group Average",
        inputs: [{type: 'input', name: 'Group'}, {type: 'input', name:'Attribute'}],
        output: ({Group, Attribute}) => groupAverage(Attribute, Group)
    },
    {
        name: "Bar Chart",
        inputs: [{type: 'input', name: 'Group'}, {type: 'input', name:'Attribute'}],
        output: ({Group, Attribute}) => groupAverage(Attribute, Group)
    },

];

export default indexBy(i => i.name, Forms);
export const Names = pluck('name', Forms);
