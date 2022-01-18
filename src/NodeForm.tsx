import { useState } from 'react'
import { Input } from './Forms'

/**
 * This functions creates the jsx for nodes that are passed in from Forms
 * @param param0 
 * @returns 
 */
export default function NodeForm ({ title, id, data = {}, defaults = {}, inputs, onChange, output = i => i} : { id: string, data: any, defaults?: any, title: string, inputs: Input[], onChange: any, output?: (data: { [key: string]: string }) => any }) {
    const [state, setState] = useState(defaults)
    const change = (data: any) => {
      setState(data)
      onChange(id, output(data))
    }
  
    return (
        <div>
          <h4>{title}</h4>
          {inputs.map(input => {
            switch (input.type) {
              case 'input':
                return <input type='text' spellCheck='false' value={state[input.name]} placeholder={input.name} onChange={(e) => change({...state, [input.name]: e.target.value})}/>
              case 'select':
                return <select onChange={(e) => change({...state, [input.name]: e.target.value})} value={state[input.name]}>
                  {input.options.map((option: any) => <option>{option}</option>)}
                </select>
              case 'date':
                return (<div>{input.name} <input type='date' value={state[input.name]} onChange={(e) => change({...state, [input.name]: e.target.value})}/></div>)
              default:
                return null
            }
          })}
        </div>
    )
  }