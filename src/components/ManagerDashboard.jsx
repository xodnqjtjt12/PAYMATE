import React, { useState } from 'react';
import styled from 'styled-components';
import Payroll from './Payroll';
import WorkCalendar from './WorkCalendar';
import ManagerDashboardSelector from './ManagerDashboardSelector';
import ScheduleManager from './ScheduleManager'; // Import ScheduleManager
import { startOfWeek, endOfWeek } from 'date-fns';

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

function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('payroll'); // 'payroll' or 'schedule'
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  return (
    <DashboardContainer>
      <Title>사장님 대시보드</Title>
      <ManagerDashboardSelector activeView={activeTab} setActiveView={setActiveTab} />
      {activeTab === 'payroll' ? (
        <Payroll dateRange={dateRange} />
      ) : (
        <ScheduleManager /> // Render ScheduleManager for schedule tab
      )}
    </DashboardContainer>
  );
}

export default ManagerDashboard;