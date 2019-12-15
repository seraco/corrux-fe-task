import React from 'react';
import axios from 'axios';
import './App.css';

type Machine = {
  id: number,
  metrics: {
    fuel_remaining: number,
  },
  model: {
    make: string,
    model: string,
    type: string,
  },
  serial_number: string,
}

const App = () => {
  const [data, setData] = React.useState([]);
  const [selectedModel, setSelectedModel] = React.useState('all');
  const [minFuel, setMinFuel] = React.useState(0);
  const [maxFuel, setMaxFuel] = React.useState(100);

  const fetchData = async () => {
    const result = await axios(
      `http://localhost:8081/machines`,
    );
    setData(result.data);
  };

  const filter = (machine: Machine) => {
    return machine.model.model === selectedModel || selectedModel === 'all'
  }

  const shouldSetFuel = (num: number) => (
    num <= 100 && num >= 0
  )

  const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = React.useRef<any>(); // TODO: Find appropriate type
  
    // Remember the latest callback
    React.useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval
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
    fetchData();
  }, 10000);

  return (
    <div className="App">
      <label>
        Filter by model:
        <select
          value={selectedModel}
          onChange={event => setSelectedModel(event.target.value)}>
          <option value="all">All</option>
          {Array.from(new Set(data.map((el: Machine) => el.model.model))).map(
            model => <option key={model} value={model}>{model}</option>
          )}
        </select>
      </label>
      <label>
        Minimum fuel:
        <input
          type="text"
          value={minFuel}
          onChange={event => {
            const numberMinFuel = Number(event.target.value)
            if (shouldSetFuel(numberMinFuel)) setMinFuel(numberMinFuel)
          }} />
      </label>
      <label>
        Maximum fuel:
        <input
          type="text"
          value={maxFuel}
          onChange={event => {
            const numberMaxFuel = Number(event.target.value)
            if (shouldSetFuel(numberMaxFuel)) setMaxFuel(numberMaxFuel)
          }} />
      </label>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Model</th> 
            <th>Manufacturer</th>
            <th>Type</th>
            <th>Fuel Remaining</th>
          </tr>
        </thead>
        <tbody>
          {data.filter(filter).map((el: Machine) => (
            <tr key={el.id}>
              <td>{el.serial_number}</td>
              <td>{el.model.model}</td> 
              <td>{el.model.make}</td>
              <td>{el.model.type}</td>
              <td>{el.metrics.fuel_remaining}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
