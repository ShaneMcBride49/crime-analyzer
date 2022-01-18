export default function TextOutputNode({ id, state=''} : { id: string, state: any, onChange: any}) {
    return (
        <div>
            <b>Text Output</b>
            <br/>
            {JSON.stringify(state, null, '\t')}
        </div>
    )
}
