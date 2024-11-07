// import { createRoot } from 'react-dom/client';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import '../styles/globals.css';
// import { Provider } from 'react-redux';
// import store from '../app/store.js'; // Import the Redux store
// import Login from './login.jsx';
// import Company from './companies.jsx';
// import CompanyInfo from './CompanyInfo.jsx';



// createRoot(document.getElementById('root')).render(
//   <Provider store={store}>
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/companies" element={<Company />} />
//         <Route path="/company/:id" component={<CompanyInfo/>} />
//       </Routes>
//     </Router>
//   </Provider>
// );
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../app/store.js'; // Import the Redux store
import Login from './login.jsx';
import Company from './companies.jsx';
import CompanyInfo from './CompanyInfo.jsx'; // Import CompanyInfo component
import ProtectedRoute from '../lib/protectedRoute.js';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/companies" element={
          <ProtectedRoute>
          <Company />
          </ProtectedRoute>
        } />
        <Route path="/company/:id" element={<CompanyInfo />} /> 
      </Routes>
    </Router>
  </Provider>
);
