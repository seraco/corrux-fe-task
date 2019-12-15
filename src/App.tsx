import React from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [data, setData] = React.useState([]);

  const fetchData = async () => {
    const result = await axios(
      `http://localhost:8081/machines`,
    );
    setData(result.data);
  };

  const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = React.useRef<any>(); // TODO: Find appropriate type
  
    // Remember the latest callback.
    React.useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    React.useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }
  
  React.useEffect(() => {
    fetchData();
  }, []);

  useInterval(() => {
    // Your custom logic here
    fetchData();
  }, 10000);

  return (
    <div className="App">
      {JSON.stringify(data)}
    </div>
  );
}

export default App;
