import { useEffect, useState } from 'react'

export default function MapHeatNode({id, onChange} : { id: string, state: any, onChange: any}) {
    const [color, setColor] = useState('#FF0000')
    const [key, setKey] = useState('')
    const [hashColor, setHashColor] = useState('')
    const opacity = 200
    const change = () => {
            onChange(id, [(data: any) =>{
                return { data, type: 'mapheat'  }
            }, id])
    }
    useEffect(change, [color, key, hashColor, id])
    return (
        <div>
            <b>Heatmap</b>
            <br/>
        </div>
    )
}
