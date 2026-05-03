import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/**
 * 프로젝트의 입구입니다. 
 * index.html의 'root'라는 빈 공간에 우리가 만든 App.jsx(진짜 프로그램)를 끼워 넣습니다.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
