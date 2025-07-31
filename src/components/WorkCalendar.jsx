import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import styled, { css } from "styled-components";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

// Styled-components for the new Toss-like UI
const CalendarWrapper = styled.div`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 15px;
    border-radius: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }
`;

const MonthDisplay = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #333;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`;

const EmployeeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background-color: #f9f9f9;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
    padding: 10px;
  }
`;

const StyledCalendar = styled(Calendar)`
  border: none;
  width: 100%;

  .react-calendar__navigation button {
    font-size: 16px;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }

  .react-calendar__month-view__weekdays__weekday {
    text-align: center;
    padding: 10px 0;
    font-weight: 600;
    color: #888;
    abbr {
      text-decoration: none;
    }

    @media (max-width: 768px) {
      font-size: 12px;
      padding: 8px 0;
    }
  }

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 80px;
    border-radius: 12px;
    padding: 4px;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
      background-color: #f3f4f6;
    }

    @media (max-width: 768px) {
      height: 60px;
      padding: 2px;
    }
  }

  .react-calendar__tile--active,
  .react-calendar__tile--range {
    background-color: #eef2ff;
    color: #4f46e5;
  }

  .react-calendar__tile--rangeStart,
  .react-calendar__tile--rangeEnd {
    background-color: #4f46e5;
    color: white;
  }
`;

const DayLabel = styled.div`
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const WorkHours = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  margin-top: 8px;
  background-color: #e0e7ff;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 10px;
    margin-top: 4px;
    padding: 1px 4px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
    gap: 15px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: #555;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TimeInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 14px;
  }
`;

const ModalButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 14px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 20px;
    top: 10px;
    right: 10px;
  }
`;

const WorkDetailsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const WorkDetailsItem = styled.li`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const DetailText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const mockUser = { uid: "test-employee-id" };

function WorkCalendar({ isManager = false, onDateRangeChange }) {
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [allWorkRecords, setAllWorkRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [shiftPressed, setShiftPressed] = useState(false);

  const [showWorkDetailsModal, setShowWorkDetailsModal] = useState(false);
  const [selectedDayWorkDetails, setSelectedDayWorkDetails] = useState([]);
  const [selectedDateForDetails, setSelectedDateForDetails] = useState(null);

  const user = !isManager ? mockUser : null; // Use mock user for employee view

  const fetchEmployees = useCallback(async () => {
    const employeesCollection = collection(db, "employees");
    const employeeSnapshot = await getDocs(employeesCollection);
    const employeeList = employeeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(employeeList);
  }, []);

  const fetchWorkRecords = useCallback(async () => {
    const start = startOfMonth(activeStartDate);
    const end = endOfMonth(activeStartDate);
    let recordsQuery;

    if (isManager) {
      recordsQuery = query(
        collection(db, "workRecords"),
        where("clockInTime", ">=", Timestamp.fromDate(start)),
        where("clockInTime", "<=", Timestamp.fromDate(end))
      );
    } else if (user) {
      recordsQuery = query(
        collection(db, "workRecords"),
        where("employeeId", "==", user.uid),
        where("clockInTime", ">=", Timestamp.fromDate(start)),
        where("clockInTime", "<=", Timestamp.fromDate(end))
      );
    }

    if (recordsQuery) {
      const snapshot = await getDocs(recordsQuery);
      const records = snapshot.docs.map((doc) => {
        const data = doc.data();
        const hours = data.clockOutTime
          ? (data.clockOutTime.toMillis() - data.clockInTime.toMillis()) /
            3600000
          : 0;
        return {
          id: doc.id,
          ...data,
          date: data.clockInTime.toDate(),
          hours: parseFloat(hours.toFixed(1)),
        };
      });
      setAllWorkRecords(records);
    }
  }, [user, activeStartDate, isManager]);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Shift" && setShiftPressed(true);
    const handleKeyUp = (e) => e.key === "Shift" && setShiftPressed(false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isManager) {
      fetchEmployees();
    }
    fetchWorkRecords();
  }, [fetchEmployees, fetchWorkRecords, isManager]);

  const handleDateChange = (newDate) => {
    if (shiftPressed && Array.isArray(date)) {
      const range = { start: startOfDay(date[0]), end: endOfDay(newDate) };
      setDate([range.start, range.end]);
      if (onDateRangeChange) onDateRangeChange(range);
    } else {
      setDate(newDate);
      if (onDateRangeChange)
        onDateRangeChange({
          start: startOfDay(newDate),
          end: endOfDay(newDate),
        });
    }
  };

  const handleTileClick = async (value, view) => {
    if (view === "month" && !isManager) {
      // Only for employee dashboard
      setSelectedDateForDetails(value);
      const startOfDayDate = startOfDay(value);
      const endOfDayDate = endOfDay(value);

      const q = query(
        collection(db, "workRecords"),
        where("clockInTime", ">=", Timestamp.fromDate(startOfDayDate)),
        where("clockInTime", "<=", Timestamp.fromDate(endOfDayDate))
      );
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const hours = data.clockOutTime
          ? (data.clockOutTime.toMillis() - data.clockInTime.toMillis()) /
            3600000
          : 0;
        return {
          id: doc.id,
          ...data,
          date: data.clockInTime.toDate(),
          hours: parseFloat(hours.toFixed(1)),
        };
      });

      // Fetch all employees to get their names and wages
      const employeesCollection = collection(db, "employees");
      const employeeSnapshot = await getDocs(employeesCollection);
      const employeeMap = new Map(
        employeeSnapshot.docs.map((doc) => [
          doc.id,
          { id: doc.id, ...doc.data() },
        ])
      );

      const details = records.map((record) => {
        const employee = employeeMap.get(record.employeeId);
        const employeeName = employee ? employee.name : "알 수 없는 직원";
        const wage = employee ? employee.wage : 0;
        const estimatedSalary = record.hours * wage;
        return { ...record, employeeName, estimatedSalary };
      });

      setSelectedDayWorkDetails(details);
      setShowWorkDetailsModal(true);
    }
  };

  const getTileContent = useCallback(
    ({ date: tileDate, view }) => {
      if (view !== "month") return null;

      const recordsForDay = allWorkRecords.filter(
        (r) =>
          isSameDay(r.date, tileDate) &&
          (selectedEmployee === "all" || r.employeeId === selectedEmployee)
      );

      const totalHours = recordsForDay.reduce((sum, r) => sum + r.hours, 0);

      return (
        <>
          {/* <DayLabel>{format(tileDate, 'd')}</DayLabel> */}
          {totalHours > 0 && <WorkHours>{totalHours.toFixed(1)}h</WorkHours>}
        </>
      );
    },
    [allWorkRecords, selectedEmployee, isManager]
  ); // Added isManager to dependencies

  const tileClassName = ({ date: tileDate, view }) => {
    if (
      view === "month" &&
      Array.isArray(date) &&
      isWithinInterval(tileDate, { start: date[0], end: date[1] })
    ) {
      return "react-calendar__tile--range";
    }
    return null;
  };

  return (
    <CalendarWrapper>
      <Header>
        <MonthDisplay>{format(activeStartDate, "yyyy년 M월")}</MonthDisplay>
        {isManager && (
          <EmployeeSelect
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">모든 직원</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </EmployeeSelect>
        )}
      </Header>
      <StyledCalendar
        onChange={handleDateChange}
        value={date}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        tileContent={getTileContent}
        tileClassName={tileClassName}
        selectRange={shiftPressed}
        onClickDay={handleTileClick} // Add onClickDay handler
      />

      {showWorkDetailsModal && !isManager && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowWorkDetailsModal(false)}>
              &times;
            </CloseButton>
            <ModalTitle>
              {format(selectedDateForDetails, "yyyy년 M월 d일")} 근무 현황
            </ModalTitle>
            <WorkDetailsList>
              {selectedDayWorkDetails.length > 0 ? (
                selectedDayWorkDetails.map((detail) => (
                  <WorkDetailsItem key={detail.id}>
                    <DetailText>직원: {detail.employeeName}</DetailText>
                    <DetailText>
                      출근: {format(detail.clockInTime.toDate(), "HH:mm")}
                    </DetailText>
                    <DetailText>
                      퇴근: {format(detail.clockOutTime.toDate(), "HH:mm")}
                    </DetailText>
                    <DetailText>근무 시간: {detail.hours}시간</DetailText>
                    <DetailText>
                      예상 급여: {detail.estimatedSalary.toLocaleString()}원
                    </DetailText>
                  </WorkDetailsItem>
                ))
              ) : (
                <DetailText>해당 날짜에 근무 기록이 없습니다.</DetailText>
              )}
            </WorkDetailsList>
          </ModalContent>
        </ModalOverlay>
      )}
    </CalendarWrapper>
  );
}

export default WorkCalendar;
