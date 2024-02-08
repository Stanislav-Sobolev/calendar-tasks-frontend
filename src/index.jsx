import ReactDOM from 'react-dom/client';
import {App} from './App';
import './index.css';
import './assets/css/colorVars.css';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <App/>
);