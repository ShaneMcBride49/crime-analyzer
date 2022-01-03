import { indexBy, pluck } from 'ramda';

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
    inputs: Input[]
}
function single(name: string): Input[] {
    return [{ type: 'input', name }];
}

const Forms: Form[] = [
    {
        name: "Average",
        inputs: single('Attribute')
    },
    {
        name: "Pluck",
        inputs: single('Attribute')
    },
    {
        name: "Sum",
        inputs: single('Attribute')
    },
    {
        name: "Limit",
        inputs: single('Count')
    },
    {   name: "Skip",
        inputs: single('Count')
    },
    {
        name: "Distinct",
        inputs: single('Attribute')
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
                options: ['==', '!=']
            },
            {
                name: 'Value',
                type: 'input'
            },
        ]
    }
];

export default indexBy(i=>i.name, Forms);
export const Names = pluck('name', Forms);
