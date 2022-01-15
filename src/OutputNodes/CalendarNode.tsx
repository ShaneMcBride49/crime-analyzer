import {reduceBy, toPairs } from "ramda";
import { useMemo, useState } from "react";
import { Calendar } from '@nivo/calendar';

export  default function CalendarNode ({ id, state=[]} : { id: string, state: any}) {
    const [key, setKey] = useState('');
    const keys = useMemo(() => toPairs(key===''?state:reduceBy((a:number)=> a + 1, 0, (i: any)=> i[key], state)).map((i)=>({day: i[0].split('T')[0], value:i[1]})), [state, key])
    return (
        <div>
            <input type="text" value={key} placeholder="key" onChange={(e) => setKey(e.target.value)}/>
            <Calendar
                data={keys}//data.keys
                width={1000}
                height={500}
                from="2019-01-01"
                to="2022-01-13"
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            />
        </div>
    )
}
