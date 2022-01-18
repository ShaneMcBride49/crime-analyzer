import {useEffect, useState} from 'react'

export default function MapPointsNode({id, onChange}: { id: string, state: any, onChange: any }) {
    const [color, setColor] = useState('#FF0000')
    const [key, setKey] = useState('')
    const [hashColor, setHashColor] = useState(false)
    const change = () => {
        onChange(id, [(data: any) =>{
            return { id, data, type: 'mappoints', color, hashColor, key }
        }, id])
    }
    useEffect(change, [color, key, hashColor, id])

    return (
        <div>
            <b>Map Icons</b>
            <br/>
            Hash color by key?
            <input type='checkbox' onChange={(e) => setHashColor(e.target.checked)}/>
            {!hashColor &&<span><br/><input type='color' value={color} onChange={(e) => setColor(e.target.value)}/></span>}
            {hashColor && <span><br/> Key: <input type='text' value={key} onChange={(e) => setKey(e.target.value)}/></span>}
        </div>
    )
}
