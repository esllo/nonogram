import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from '@/containers/Home';
import Solve from './containers/Solve';
import Draw from './containers/Draw';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solve" element={<Solve />} />
          <Route path="/draw" element={<Draw />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
