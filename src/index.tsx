import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Panes from './Panes'

import reportWebVitals from './reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
      <div className='window'>
          <Panes/>
      </div>
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals()
