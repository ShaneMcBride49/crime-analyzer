import {Element} from './App';
import {partition} from 'ramda';
import {Edge, Node} from 'react-flow-renderer';
function buildChains(graph: Element[]) {
    const [edges, nodes] = partition((i) => 'source' in i, graph) as [Edge[], Node[]];
    const startingNodes = nodes.filter(i => i.type === 'input');

    const chains = startingNodes.flatMap(start => {
        let chains: Element[][] = [[start]];
        let counts = '';
        while (chains.map(i => i.length).join('-') !== counts) {
            counts = chains.map(i => i.length).join('-');
            chains = chains.flatMap(chain => {
                const top = chain[chain.length - 1].id;
                const next = edges.filter(i => i.source === top);
                return next.length ?
                    // @ts-ignore This will always return a result
                    next.map(i => chain.concat([nodes.find(j => j.id === i.target)])) :
                    [chain];
            })
        }
        return chains;
    })
    return chains.map(chain => chain.map(i => i.id));
}

export default buildChains;
