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
};

const App = () => {
  // State of the application
  const [data, setData] = React.useState([]);
  const [selectedModel, setSelectedModel] = React.useState('all');
  const [minFuel, setMinFuel] = React.useState(0);
  const [maxFuel, setMaxFuel] = React.useState(100);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Custom hook for using intervals
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
  };
  
  // Hook for fetching data initially
  React.useEffect(() => {
    fetchData();
  }, []);

  // Hook for fetching data every 10 seconds
  useInterval(() => {
    fetchData();
  }, 10000);


  const fetchData = async () => {
    const result = await axios(
      `http://localhost:8081/machines`,
    );
    setData(result.data);
  };

  // Filter function for returning filtered data
  const filter = (machine: Machine) => {
    const isSelectedModel = machine.model.model === selectedModel;

    // Filters
    const modelFilter = isSelectedModel || selectedModel === 'all';
    const minFuelFilter = machine.metrics.fuel_remaining >= minFuel;
    const maxFuelFilter = machine.metrics.fuel_remaining <= maxFuel;
  
    return modelFilter && minFuelFilter && maxFuelFilter;
  };

  const filteredData = data.filter(filter);

  // For controling range of allowed fuel level
  const shouldSetFuel = (num: number) => (num <= 100 && num >= 0);

  // Variables for handling pagination of the table
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const isValidPage = (page: number) => (page <= totalPages && page >= 1);
  const firstIndexInPage = (currentPage - 1) * itemsPerPage;
  const lastIndexInPage = currentPage * itemsPerPage;

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
            const numberMinFuel = Number(event.target.value);
            if (shouldSetFuel(numberMinFuel)) setMinFuel(numberMinFuel);
          }} />
      </label>
      <label>
        Maximum fuel:
        <input
          type="text"
          value={maxFuel}
          onChange={event => {
            const numberMaxFuel = Number(event.target.value);
            if (shouldSetFuel(numberMaxFuel)) setMaxFuel(numberMaxFuel);
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
          {filteredData.slice(
            firstIndexInPage,
            lastIndexInPage,
          ).map((el: Machine) => (
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
      <label>
        Page number:
        <input
          type="number"
          value={currentPage}
          onChange={event => {
            const page = Number(event.target.value);
            if (isValidPage(page)) setCurrentPage(page);
          }} />
        Total pages: {totalPages}
      </label>
    </div>
  );
}

export default App;
