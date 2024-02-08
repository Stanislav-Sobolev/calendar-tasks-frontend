import ReactDOM from 'react-dom/client';
import {App} from './App';
import './index.css';
import './assets/scss/colorVars.css';
import Calendar from './Components/Calendar/Calendar';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <Calendar />
  // <App/>
);