import React from 'react';
import styled from 'styled-components';
import TimeTracker from './TimeTracker';
import WorkCalendar from './WorkCalendar'; // Import the calendar

const DashboardContainer = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 25px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

function EmployeeDashboard() {
  return (
    <DashboardContainer>
      <Title>직원 대시보드</Title>
      <TimeTracker />
      <WorkCalendar /> {/* Add the calendar here */}
    </DashboardContainer>
  );
}

export default EmployeeDashboard;
