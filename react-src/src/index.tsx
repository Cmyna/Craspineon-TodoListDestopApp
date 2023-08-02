import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import { TodoDataModel, TodoPage } from './components';
//import reportWebVitals from './reportWebVitals';
import { init, events, window } from "@neutralinojs/lib"

// TODO: temporal design for stick window to desktop (WindowLooper Element)
//  refactor with modified neutralinojs event and window controller in the future

// TODO: collect side effect from neutralinojs (encapsulate all used neutralinojs api to a single js file)

const WindowLooper = (props):React.JSX.Element => {
  const [sign, setSign] = useState(0)
  useEffect(() => {
    //setSign(sign + 1)
    //window.isVisible().then((res) => console.log(res))
    setTimeout(async () => {
      const pos = await window.getPosition()
      if (pos.x<-10 && pos.y<-10) { // if minimize, the pos will be set to a large negative value (in my computer)
        await window.maximize()
        await window.unmaximize()
      }
      //console.log(pos)
      setSign(sign + 1)
      
      //window.isVisible().then((res) => console.log(res))
    }, 12)
  })
  return (<div></div>)
}


// main window page setup
const root = ReactDOM.createRoot(document.getElementById('root') as any);
root.render(
  // <React.StrictMode>
  <div>
    <WindowLooper />
    <TodoDataModel pageElement={<TodoPage/>} />
  </div>
  // </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
init()
// export {root}

events.on("windowBlur", ()=> {
  console.log("windowblur")
})





