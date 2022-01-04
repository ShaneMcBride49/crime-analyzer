import {drop, indexBy, pluck, sum, take, uniq, uniqBy} from 'ramda';
import filter from './filter';
import request from './request';
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
        output: ({By}) => {
            return (arr: number[] | number) => Array.isArray(arr)? arr.map((i)=>i*+By): arr*+By;
        }
    },
    {
        name: "Request",
        inputs: single('URL'),
        start: true,
        output: ({URL}) => () => request(URL)
    }
];

export default indexBy(i => i.name, Forms);
export const Names = pluck('name', Forms);
