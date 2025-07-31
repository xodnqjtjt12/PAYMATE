import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';

const ScheduleManagerContainer = styled.div`
  background-color: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin-top: 30px;

  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 20px;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: #fff;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.2s;
  grid-column: span 2; /* Span across two columns for larger screens */

  &:hover { background-color: #0056b3; }

  @media (max-width: 768px) {
    grid-column: span 1;
    font-size: 14px;
    padding: 12px;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th, td {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f1f3f5;
  }

  @media (max-width: 768px) {
    min-width: 600px; /* Ensure table is wide enough to scroll */
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.edit ? '#ffc107' : '#dc3545'};
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;

  &:hover { background-color: ${props => props.edit ? '#e0a800' : '#c82333'}; }
`;

function ScheduleManager() {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null); // For editing
  const [formState, setFormState] = useState({
    employeeId: '',
    date: '',
    clockIn: '',
    clockOut: '',
  });

  const fetchEmployees = useCallback(async () => {
    const employeesCollection = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCollection);
    const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEmployees(employeeList);
    if (employeeList.length > 0 && !formState.employeeId) {
      setFormState(prev => ({ ...prev, employeeId: employeeList[0].id }));
    }
  }, [formState.employeeId]);

  const fetchSchedules = useCallback(async () => {
    const q = query(collection(db, 'workRecords'), orderBy('clockInTime', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedSchedules = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeId: data.employeeId,
        date: format(data.clockInTime.toDate(), 'yyyy-MM-dd'),
        clockIn: format(data.clockInTime.toDate(), 'HH:mm'),
        clockOut: data.clockOutTime ? format(data.clockOutTime.toDate(), 'HH:mm') : '',
      };
    });
    setSchedules(fetchedSchedules);
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, [fetchEmployees, fetchSchedules]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employeeId, date, clockIn, clockOut } = formState;

    let clockInDate = parseISO(`${date}T${clockIn}`);
    let clockOutDate = parseISO(`${date}T${clockOut}`);

    if (clockOutDate < clockInDate) {
      clockOutDate.setDate(clockOutDate.getDate() + 1);
    }

    const recordData = {
      employeeId: employeeId,
      clockInTime: Timestamp.fromDate(clockInDate),
      clockOutTime: Timestamp.fromDate(clockOutDate),
      location: { latitude: 0, longitude: 0 }, // Default for manual entry
    };

    try {
      if (currentSchedule) {
        await updateDoc(doc(db, 'workRecords', currentSchedule.id), recordData);
      } else {
        await addDoc(collection(db, 'workRecords'), recordData);
      }
      setFormState({ employeeId: employees[0]?.id || '', date: '', clockIn: '', clockOut: '' });
      setCurrentSchedule(null);
      fetchSchedules(); // Refresh list
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('스케줄 저장에 실패했습니다.');
    }
  };

  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setFormState({
      employeeId: schedule.employeeId,
      date: schedule.date,
      clockIn: schedule.clockIn,
      clockOut: schedule.clockOut,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'workRecords', id));
        fetchSchedules(); // Refresh list
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('스케줄 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <ScheduleManagerContainer>
      <Title>{currentSchedule ? '스케줄 수정' : '새 스케줄 추가'}</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="employeeId">직원:</Label>
          <Select name="employeeId" id="employeeId" value={formState.employeeId} onChange={handleFormChange} required>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="date">날짜:</Label>
          <Input type="date" name="date" id="date" value={formState.date} onChange={handleFormChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="clockIn">출근 시간:</Label>
          <Input type="time" name="clockIn" id="clockIn" value={formState.clockIn} onChange={handleFormChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="clockOut">퇴근 시간:</Label>
          <Input type="time" name="clockOut" id="clockOut" value={formState.clockOut} onChange={handleFormChange} required />
        </FormGroup>
        <Button type="submit">{currentSchedule ? '스케줄 수정' : '스케줄 추가'}</Button>
      </Form>

      <Title>등록된 스케줄</Title>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>직원</th>
              <th>날짜</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{employees.find(emp => emp.id === schedule.employeeId)?.name || schedule.employeeId}</td>
                <td>{schedule.date}</td>
                <td>{schedule.clockIn}</td>
                <td>{schedule.clockOut}</td>
                <td>
                  <ActionButton edit onClick={() => handleEdit(schedule)}>수정</ActionButton>
                  <ActionButton onClick={() => handleDelete(schedule.id)}>삭제</ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </ScheduleManagerContainer>
  );
}

export default ScheduleManager;