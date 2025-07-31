import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #e9ecef;
  border-radius: 12px;
  padding: 5px;

  @media (max-width: 768px) {
    margin-bottom: 15px;
    padding: 3px;
  }
`;

const SelectorButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background-color: ${props => props.active ? '#fff' : 'transparent'};
  color: ${props => props.active ? '#007bff' : '#495057'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 16px;
  }
`;

function DashboardSelector({ activeView, setActiveView }) {
  return (
    <SelectorContainer>
      <SelectorButton 
        active={activeView === 'employee'} 
        onClick={() => setActiveView('employee')}
      >
        직원
      </SelectorButton>
      <SelectorButton 
        active={activeView === 'manager'} 
        onClick={() => setActiveView('manager')}
      >
        사장님
      </SelectorButton>
    </SelectorContainer>
  );
}

export default DashboardSelector;