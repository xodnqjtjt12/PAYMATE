import React, { useState } from 'react';
import styled from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Header from './components/Header';
import AdBanner from './components/AdBanner';
import DashboardSelector from './components/DashboardSelector';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f6f8;
  width: 100%; /* Ensure it takes full width on mobile */
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 1200px;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

function App() {
  const [activeView, setActiveView] = useState('employee'); // 'employee' or 'manager'

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <AdBanner />
        <MainContent>
          <DashboardSelector activeView={activeView} setActiveView={setActiveView} />
          {activeView === 'employee' ? <EmployeeDashboard /> : <ManagerDashboard />}
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
