import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Box1 from './components/Box1'
import Box2 from './components/Box2'
import CheckerViewer from './components/CheckerViewer'
import { useGlobalMaker } from '../..'

function App() {
  // useGlobalMaker('myGlobal', 0, {
  //   increase: (state) => state + 1,
  //   decrease: (state) => state - 1,
  //   increaseBy: (state, value) => state + value
  // });

  useGlobalMaker({
    name: 'myGlobal',
    initialState: 0,
    modifiers: {
      increase: (state) => state + 1,
      decrease: (state) => state - 1,
      increaseBy: (state, value) => state + value
    }
  });

  return (
    <main className="App">
      <h2>useGlobal:</h2>
      <div className='box-container'>
        <Box1 />
        <Box2 />
      </div>
      <h2>useChecker:</h2>
      <CheckerViewer />
    </main>
  )
}

export default App
