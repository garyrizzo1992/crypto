import logo from './logo.svg';
import './App.css';
import React from 'react'


data = {

}

function App() {
  const [data, setData] = React.useState(null)

  React.useEffect(() => {
    fetch("/bal")
      .then((res) => res)
      .then((data) => setData(data.message))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
}

export default App;
