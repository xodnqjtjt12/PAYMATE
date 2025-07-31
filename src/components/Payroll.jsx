import React, { useState, useEffect } from "react";
import styled from "styled-components";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { startOfWeek, endOfWeek } from "date-fns";

const Section = styled.section`
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin-top: 32px;
  font-family: "Pretendard", "Roboto", sans-serif;

  @media (max-width: 768px) {
    padding: 16px;
    margin-top: 24px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Pretendard", "Roboto", sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  width: 200px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #0064ff;
    box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
  }
`;

const Form = styled.form`
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Pretendard", "Roboto", sans-serif;
  color: #1a1a1a;
  flex: 1;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #0064ff;
    box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #0064ff;
  color: #ffffff;
  font-family: "Pretendard", "Roboto", sans-serif;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0052cc;
  }
  &:disabled {
    background-color: #e8ecef;
    color: #adb5bd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
    padding: 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-family: "Pretendard", "Roboto", sans-serif;

  th,
  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    color: #1a1a1a;
  }

  th {
    background-color: #f5f6f5;
    font-weight: 600;
    font-size: 14px;
    color: #4a4a4a;
  }

  tbody tr:hover {
    background-color: #f8fafc;
  }

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;

    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    tr {
      border: 1px solid #f0f0f0;
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;
      background-color: #ffffff;
    }

    td {
      border: none;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      padding-left: 50%;
      text-align: right;
      font-size: 14px;

      &:before {
        position: absolute;
        top: 12px;
        left: 8px;
        width: 45%;
        padding-right: 10px;
        white-space: nowrap;
        text-align: left;
        font-weight: 600;
        color: #4a4a4a;
        font-size: 14px;
      }
    }

    td:nth-of-type(1):before {
      content: "이름";
    }
    td:nth-of-type(2):before {
      content: "시급";
    }
    td:nth-of-type(3):before {
      content: "입력된 근무 시간";
    }
    td:nth-of-type(4):before {
      content: "기록된 근무 시간";
    }
    td:nth-of-type(5):before {
      content: "예상 급여";
    }
    td:nth-of-type(6):before {
      content: "관리";
    }
  }
`;

const DeleteButton = styled.button`
  background-color: #ff2e2e;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: "Pretendard", "Roboto", sans-serif;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e60000;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

function Payroll({ dateRange }) {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    wage: "",
    hoursWorked: "",
  });
  const [displayValues, setDisplayValues] = useState({
    wage: "",
    hoursWorked: "",
  });
  const [workRecords, setWorkRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  const fetchEmployees = async () => {
    const employeesCollection = collection(db, "employees");
    const employeeSnapshot = await getDocs(employeesCollection);
    const employeeList = employeeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(employeeList);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    const fetchWorkRecords = async () => {
      const q = query(
        collection(db, "workRecords"),
        where("clockInTime", ">=", Timestamp.fromDate(dateRange.start)),
        where("clockInTime", "<=", Timestamp.fromDate(dateRange.end))
      );

      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setWorkRecords(records);
    };

    fetchWorkRecords();
  }, [dateRange]);

  const formatCurrency = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("ko-KR") + "원";
  };

  const formatHours = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("ko-KR") + "시간";
  };

  const numberToKorean = (number) => {
    if (!number) return "";
    const units = ["", "만", "억", "조"];
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    if (number < 1000) return String(number);

    let result = "";
    let unitIndex = 0;
    while (number > 0) {
      const chunk = number % 10000;
      if (chunk > 0) {
        let chunkStr = "";
        if (chunk >= 1000) {
          const thousands = Math.floor(chunk / 1000);
          if (thousands > 0) chunkStr += digits[thousands] + "천";
        }
        const hundreds = chunk % 1000;
        if (hundreds >= 100) {
          const hundredVal = Math.floor(hundreds / 100);
          if (hundredVal > 0) chunkStr += digits[hundredVal] + "백";
        }
        const tens = hundreds % 100;
        if (tens >= 10) {
          const tensVal = Math.floor(tens / 10);
          if (tensVal > 0) chunkStr += digits[tensVal] + "십";
        }
        const ones = tens % 10;
        if (ones > 0) {
          chunkStr += digits[ones];
        }
        result = chunkStr + units[unitIndex] + (result ? "" : "") + result;
      }
      number = Math.floor(number / 10000);
      unitIndex++;
    }
    return result.trim();
  };

  const handleInputChange = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setNewEmployee({ ...newEmployee, [field]: numericValue });
    setDisplayValues({ ...displayValues, [field]: value });
  };

  const handleInputBlur = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setDisplayValues({
        ...displayValues,
        [field]:
          field === "wage"
            ? formatCurrency(numericValue)
            : formatHours(numericValue),
      });
      setNewEmployee({ ...newEmployee, [field]: numericValue });
    } else {
      setDisplayValues({ ...displayValues, [field]: "" });
      setNewEmployee({ ...newEmployee, [field]: "" });
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (newEmployee.name && newEmployee.wage && newEmployee.hoursWorked) {
      try {
        const employeeId = doc(collection(db, "employees")).id;
        await setDoc(doc(db, "employees", employeeId), {
          name: newEmployee.name,
          wage: Number(newEmployee.wage),
          hoursWorked: Number(newEmployee.hoursWorked),
        });
        setNewEmployee({ name: "", wage: "", hoursWorked: "" });
        setDisplayValues({ wage: "", hoursWorked: "" });
        await fetchEmployees();
      } catch (error) {
        console.error("Error adding employee:", error.message);
        alert(`직원 추가에 실패했습니다: ${error.message}`);
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (
      window.confirm(
        "정말로 이 직원을 삭제하시겠습니까? 관련 근무 기록은 삭제되지 않습니다."
      )
    ) {
      try {
        await deleteDoc(doc(db, "employees", employeeId));
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error.message);
        alert(`직원 삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  const getWorkHours = (employeeId) => {
    const employeeRecords = workRecords.filter(
      (r) =>
        r.employeeId === employeeId &&
        r.clockInTime.toDate() >= dateRange.start &&
        r.clockInTime.toDate() <= dateRange.end
    );
    const totalHours = employeeRecords.reduce((sum, record) => {
      if (record.clockOutTime && record.clockInTime) {
        const hours =
          (record.clockOutTime.toMillis() - record.clockInTime.toMillis()) /
          (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    return totalHours.toFixed(1);
  };

  const filteredEmployees =
    selectedEmployee === "all"
      ? employees
      : employees.filter((emp) => emp.id === selectedEmployee);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.text("급여 보고서", 20, 10);
    doc.autoTable({
      head: [
        [
          "이름",
          "시급",
          "입력된 근무 시간",
          "기록된 근무 시간",
          "예상 급여",
          "삭제",
        ],
      ],
      body: filteredEmployees.map((emp) => {
        const hoursWorked = emp.hoursWorked || 0;
        const recordedHours = getWorkHours(emp.id);
        const salary = recordedHours * emp.wage;
        return [
          emp.name,
          formatCurrency(emp.wage),
          `${hoursWorked}시간`,
          `${recordedHours}시간`,
          `${formatCurrency(Math.round(salary))} (${numberToKorean(
            Math.round(salary)
          )})`,
          "",
        ];
      }),
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: [26, 26, 26],
        lineColor: [240, 240, 240],
      },
      headStyles: {
        fillColor: [245, 246, 245],
        textColor: [74, 74, 74],
        fontStyle: "bold",
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save("급여_보고서.pdf");
  };

  return (
    <Section>
      <Title>급여 관리</Title>
      <FilterContainer>
        <Select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="all">모두 보기</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </Select>
      </FilterContainer>
      <Form onSubmit={handleAddEmployee}>
        <Input
          type="text"
          placeholder="직원 이름"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          required
        />
        <Input
          type="text"
          placeholder="시급 (원)"
          value={displayValues.wage}
          onChange={(e) => handleInputChange("wage", e.target.value)}
          onBlur={(e) => handleInputBlur("wage", e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="근무 시간 (시간)"
          value={displayValues.hoursWorked}
          onChange={(e) => handleInputChange("hoursWorked", e.target.value)}
          onBlur={(e) => handleInputBlur("hoursWorked", e.target.value)}
          required
        />
        <Button type="submit">직원 추가</Button>
      </Form>

      <Title>직원 목록 및 급여</Title>
      <Button
        onClick={downloadPdf}
        disabled={filteredEmployees.length === 0}
        style={{ marginBottom: "24px" }}
      >
        PDF 보고서 다운로드
      </Button>
      <Table>
        <thead>
          <tr>
            <th>이름</th>
            <th>시급</th>
            <th>입력된 근무 시간</th>
            <th>기록된 근무 시간</th>
            <th>예상 급여</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => {
            const hoursWorked = employee.hoursWorked || 0;
            const recordedHours = getWorkHours(employee.id);
            const salary = recordedHours * employee.wage;
            return (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{formatCurrency(employee.wage)}</td>
                <td>{hoursWorked}시간</td>
                <td>{recordedHours}시간</td>
                <td>
                  {formatCurrency(Math.round(salary))} (
                  {numberToKorean(Math.round(salary))})
                </td>
                <td>
                  <DeleteButton
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    삭제
                  </DeleteButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Section>
  );
}

export default Payroll;
