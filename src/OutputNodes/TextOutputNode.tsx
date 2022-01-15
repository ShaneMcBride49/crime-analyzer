export default function TextOutputNode({ id, state=''} : { id: string, state: any}) {
    return (
        <div>
            {JSON.stringify(state, null, '\t')}
        </div>
    );
}
