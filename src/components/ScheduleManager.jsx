import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  setDoc,
  where,
} from "firebase/firestore";
import { format, parseISO, differenceInHours } from "date-fns";
import * as XLSX from "xlsx";

const ScheduleManagerContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterLabel = styled.label`
  font-size: 15px;
  font-weight: 600;
  color: #4a4a4a;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const FormContainer = styled.div`
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  background-color: #f8fafc;
  position: relative;

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
  color: #4a4a4a;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Pretendard", "Roboto", sans-serif;
  color: #1a1a1a;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #0064ff;
    box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }

  &.error {
    border-color: #ff2e2e;
    box-shadow: 0 0 0 3px rgba(255, 46, 46, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px;
  }
`;

const Select = styled.select`
  padding: 14px 20px; /* 박스 크게 */
  border: 1px solid #e8ecef;
  border-radius: 10px;
  font-size: 16px; /* 폰트 크게 */
  font-family: "Pretendard", "Roboto", sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  appearance: none;

  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 2px center; /* 더 오른쪽으로 */
  background-size: 18px;

  &:focus {
    outline: none;
    border-color: #0064ff;
    box-shadow: 0 0 0 3px rgba(0, 100, 255, 0.1);
  }

  &.error {
    border-color: #ff2e2e;
    box-shadow: 0 0 0 3px rgba(255, 46, 46, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
    background-position: right 12px center; /* 모바일에선 다시 안쪽으로 */
    background-size: 16px;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  font-size: 14px;
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
    font-size: 14px;
    padding: 12px;
    width: 100%;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #0064ff;
  border-radius: 8px;
  cursor: pointer;
  background-color: #ffffff;
  color: #0064ff;
  font-family: "Pretendard", "Roboto", sans-serif;
  transition: all 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 13px;
  }
`;

const BulkButton = styled(AddButton)`
  border-color: #28a745;
  color: #28a745;

  &:hover {
    background-color: #e8f5e9;
  }
`;

const DeleteFormButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff2e2e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
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

const ActionButton = styled.button`
  background-color: ${(props) => (props.edit ? "#0064ff" : "#ff2e2e")};
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: "Pretendard", "Roboto", sans-serif;
  transition: background-color 0.2s;
  margin-right: 8px;

  &:hover {
    background-color: ${(props) => (props.edit ? "#0052cc" : "#e60000")};
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
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
      content: "직원";
    }
    td:nth-of-type(2):before {
      content: "날짜";
    }
    td:nth-of-type(3):before {
      content: "출근";
    }
    td:nth-of-type(4):before {
      content: "퇴근";
    }
    td:nth-of-type(5):before {
      content: "근무 시간";
    }
    td:nth-of-type(6):before {
      content: "관리";
    }
  }
`;

const ExcelButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FileInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: 2px dashed #e8ecef;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.2s;
  min-height: 60px;
  cursor: pointer;

  &:hover,
  &.dragover {
    border-color: #0064ff;
    background-color: #e6f0ff;
  }

  @media (max-width: 768px) {
    padding: 12px;
    min-height: 50px;
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #0064ff;
  font-family: "Pretendard", "Roboto", sans-serif;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const WorkHours = styled.div`
  font-size: 14px;
  color: #4a4a4a;
  margin-top: 5px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  color: #ff2e2e;
  margin-bottom: 16px;
  font-family: "Pretendard", "Roboto", sans-serif;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #0064ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: help;
`;

const Tooltip = styled.div`
  visibility: hidden;
  width: 240px;
  background-color: #1a1a1a;
  color: #ffffff;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-family: "Pretendard", "Roboto", sans-serif;
  opacity: 0;
  transition: opacity 0.2s;

  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1a1a1a transparent transparent transparent;
  }

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 200px;
    font-size: 12px;
  }
`;

function ScheduleManager() {
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formStates, setFormStates] = useState([
    { employeeId: "", date: "", clockIn: "", clockOut: "" },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  const fetchEmployees = useCallback(async () => {
    try {
      const employeesCollection = collection(db, "employees");
      const employeeSnapshot = await getDocs(employeesCollection);
      const employeeList = employeeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched employees:", employeeList);
      setEmployees(employeeList);
      if (employeeList.length > 0 && !formStates[0].employeeId) {
        setFormStates((prev) =>
          prev.map((form, index) =>
            index === 0 ? { ...form, employeeId: employeeList[0].id } : form
          )
        );
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("직원 목록을 불러오는데 실패했습니다.");
    }
  }, [formStates]);

  const fetchSchedules = useCallback(async () => {
    try {
      let q = query(
        collection(db, "workRecords"),
        orderBy("clockInTime", "desc")
      );
      if (selectedEmployee !== "all") {
        q = query(
          collection(db, "workRecords"),
          where("employeeId", "==", selectedEmployee),
          orderBy("clockInTime", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      const fetchedSchedules = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          employeeId: data.employeeId,
          date: format(data.clockInTime.toDate(), "yyyy-MM-dd"),
          clockIn: format(data.clockInTime.toDate(), "HH:mm"),
          clockOut: data.clockOutTime
            ? format(data.clockOutTime.toDate(), "HH:mm")
            : "",
        };
      });
      console.log("Selected employee:", selectedEmployee);
      console.log("Fetched schedules:", fetchedSchedules);
      setSchedules(fetchedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error.message, error.code);
      if (error.code === "failed-precondition") {
        try {
          const q = query(
            collection(db, "workRecords"),
            orderBy("clockInTime", "desc")
          );
          const querySnapshot = await getDocs(q);
          const allSchedules = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              employeeId: data.employeeId,
              date: format(data.clockInTime.toDate(), "yyyy-MM-dd"),
              clockIn: format(data.clockInTime.toDate(), "HH:mm"),
              clockOut: data.clockOutTime
                ? format(data.clockOutTime.toDate(), "HH:mm")
                : "",
            };
          });
          if (selectedEmployee !== "all") {
            const filteredSchedules = allSchedules.filter(
              (schedule) => schedule.employeeId === selectedEmployee
            );
            setSchedules(filteredSchedules);
            console.log("Client-side filtered schedules:", filteredSchedules);
          } else {
            setSchedules(allSchedules);
          }
        } catch (fallbackError) {
          console.error("Fallback fetch failed:", fallbackError);
          alert(
            "스케줄 조회에 실패했습니다. Firebase 콘솔(https://console.firebase.google.com/)에서 'workRecords' 컬렉션에 복합 인덱스(employeeId Ascending, clockInTime Descending)를 생성하세요. 에러: " +
              error.message
          );
        }
      } else {
        alert(
          "스케줄 조회에 실패했습니다. Firebase 콘솔(https://console.firebase.google.com/)에서 'workRecords' 컬렉션에 복합 인덱스(employeeId Ascending, clockInTime Descending)를 생성하세요. 에러: " +
            error.message
        );
      }
    }
  }, [selectedEmployee]);

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, [fetchEmployees, fetchSchedules]);

  const handleFormChange = (index, e) => {
    const { name, value } = e.target;
    setFormStates((prev) =>
      prev.map((form, i) => (i === index ? { ...form, [name]: value } : form))
    );
    setMissingFields((prev) =>
      prev.filter((field) => field.formIndex !== index || field.field !== name)
    );
  };

  const addForm = () => {
    const newForm = {
      employeeId: employees[0]?.id || "",
      date: "",
      clockIn: "",
      clockOut: "",
    };
    setFormStates((prev) => [...prev, newForm]);
  };

  const removeForm = (index) => {
    if (formStates.length <= 1) {
      alert("최소 하나의 폼은 유지해야 합니다.");
      return;
    }
    setFormStates((prev) => prev.filter((_, i) => i !== index));
    setMissingFields((prev) =>
      prev.filter((field) => field.formIndex !== index)
    );
  };

  const applyBulk = () => {
    if (formStates.length <= 1) return;
    const { date, clockIn, clockOut } = formStates[0];
    if (!date || !clockIn || !clockOut) {
      alert("맨 위 폼의 날짜, 출근 시간, 퇴근 시간을 입력해주세요.");
      return;
    }
    setFormStates((prev) =>
      prev.map((form, index) =>
        index === 0 ? form : { ...form, date, clockIn, clockOut }
      )
    );
    setMissingFields((prev) =>
      prev.filter(
        (field) => !["date", "clockIn", "clockOut"].includes(field.field)
      )
    );
  };

  const calculateWorkHours = (formState) => {
    const { date, clockIn, clockOut } = formState;
    if (!date || !clockIn || !clockOut) return null;

    try {
      let clockInDate = parseISO(`${date}T${clockIn}`);
      let clockOutDate = parseISO(`${date}T${clockOut}`);

      if (clockOutDate < clockInDate) {
        clockOutDate.setDate(clockOutDate.getDate() + 1);
      }

      const hours = differenceInHours(clockOutDate, clockInDate, {
        roundingMethod: "round",
      });
      return hours.toFixed(1);
    } catch (error) {
      return null;
    }
  };

  const calculateWorkHoursForSchedule = (schedule) => {
    const { date, clockIn, clockOut } = schedule;
    if (!date || !clockIn || !clockOut) return "-";

    try {
      let clockInDate = parseISO(`${date}T${clockIn}`);
      let clockOutDate = parseISO(`${date}T${clockOut}`);

      if (clockOutDate < clockInDate) {
        clockOutDate.setDate(clockOutDate.getDate() + 1);
      }

      const hours = differenceInHours(clockOutDate, clockInDate, {
        roundingMethod: "round",
      });
      return `${hours.toFixed(1)}시간`;
    } catch (error) {
      return "-";
    }
  };

  const updateEmployeeHours = async (employeeId, additionalHours) => {
    try {
      const employeeDoc = doc(db, "employees", employeeId);
      const employeeSnapshot = await getDocs(
        query(collection(db, "employees"), where("id", "==", employeeId))
      );
      const employeeData = employeeSnapshot.docs[0]?.data();
      const currentHours = employeeData?.hoursWorked || 0;
      await setDoc(
        employeeDoc,
        { hoursWorked: Number(currentHours) + Number(additionalHours) },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating employee hours:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMissingFields = formStates
      .map((form, index) => {
        const fields = [];
        if (!form.employeeId)
          fields.push({ formIndex: index, field: "employeeId" });
        if (!form.date) fields.push({ formIndex: index, field: "date" });
        if (!form.clockIn) fields.push({ formIndex: index, field: "clockIn" });
        if (!form.clockOut)
          fields.push({ formIndex: index, field: "clockOut" });
        return fields;
      })
      .flat();

    if (newMissingFields.length > 0) {
      setMissingFields(newMissingFields);
      return;
    }

    try {
      for (const formState of formStates) {
        const { employeeId, date, clockIn, clockOut } = formState;
        if (!employeeId || !date || !clockIn || !clockOut) continue;

        let clockInDate = parseISO(`${date}T${clockIn}`);
        let clockOutDate = parseISO(`${date}T${clockOut}`);

        if (clockOutDate < clockInDate) {
          clockOutDate.setDate(clockOutDate.getDate() + 1);
        }

        const hoursWorked = differenceInHours(clockOutDate, clockInDate, {
          roundingMethod: "round",
        }).toFixed(1);

        const recordData = {
          employeeId,
          clockInTime: Timestamp.fromDate(clockInDate),
          clockOutTime: Timestamp.fromDate(clockOutDate),
          location: { latitude: 0, longitude: 0 },
        };

        if (currentSchedule) {
          await updateDoc(
            doc(db, "workRecords", currentSchedule.id),
            recordData
          );
          setCurrentSchedule(null);
        } else {
          await addDoc(collection(db, "workRecords"), recordData);
          await updateEmployeeHours(employeeId, hoursWorked);
        }
      }
      setFormStates([
        {
          employeeId: employees[0]?.id || "",
          date: "",
          clockIn: "",
          clockOut: "",
        },
      ]);
      setMissingFields([]);
      fetchSchedules();
      fetchEmployees();
    } catch (error) {
      console.error("Error saving schedules:", error);
      alert("스케줄 저장에 실패했습니다.");
    }
  };

  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setFormStates([
      {
        employeeId: schedule.employeeId,
        date: schedule.date,
        clockIn: schedule.clockIn,
        clockOut: schedule.clockOut,
      },
    ]);
    setMissingFields([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 스케줄을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "workRecords", id));
        fetchSchedules();
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("스케줄 삭제에 실패했습니다.");
      }
    }
  };

  const downloadExcelTemplate = () => {
    const data = [
      {
        employeeName: "홍길동",
        date: "2025-07-31",
        clockIn: "09:00",
        clockOut: "18:00",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");
    XLSX.write(wb, "schedule_template.xlsx");
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0] || e.dataTransfer.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        for (const row of jsonData) {
          const { employeeName, date, clockIn, clockOut } = row;
          const employee = employees.find((emp) => emp.name === employeeName);
          if (!employee) {
            alert(`직원 "${employeeName}"을 찾을 수 없습니다.`);
            continue;
          }

          let clockInDate = parseISO(`${date}T${clockIn}`);
          let clockOutDate = parseISO(`${date}T${clockOut}`);

          if (clockOutDate < clockInDate) {
            clockOutDate.setDate(clockOutDate.getDate() + 1);
          }

          const hoursWorked = differenceInHours(clockOutDate, clockInDate, {
            roundingMethod: "round",
          }).toFixed(1);

          const recordData = {
            employeeId: employee.id,
            clockInTime: Timestamp.fromDate(clockInDate),
            clockOutTime: Timestamp.fromDate(clockOutDate),
            location: { latitude: 0, longitude: 0 },
          };

          await addDoc(collection(db, "workRecords"), recordData);
          await updateEmployeeHours(employee.id, hoursWorked);
        }
        fetchSchedules();
        fetchEmployees();
        alert("엑셀 데이터가 성공적으로 등록되었습니다.");
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading excel:", error);
      alert("엑셀 업로드에 실패했습니다.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleExcelUpload(e);
  };

  return (
    <ScheduleManagerContainer>
      <Title>{currentSchedule ? "스케줄 수정" : "새 스케줄 추가"}</Title>
      {missingFields.length > 0 && (
        <ErrorMessage>입력하지 않은 부분이 있습니다.</ErrorMessage>
      )}
      <ExcelButtons>
        <Button onClick={downloadExcelTemplate}>엑셀 양식 다운로드</Button>
        <FileInputContainer
          className={isDragging ? "dragover" : ""}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileInputLabel htmlFor="file-upload">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0064ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            파일 선택 또는 드래그
            <FileInput
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
            />
          </FileInputLabel>
        </FileInputContainer>
      </ExcelButtons>
      <FormContainer>
        {formStates.map((formState, index) => (
          <Form key={index} onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor={`employeeId-${index}`}>직원:</Label>
              <Select
                name="employeeId"
                id={`employeeId-${index}`}
                value={formState.employeeId}
                onChange={(e) => handleFormChange(index, e)}
                className={
                  missingFields.some(
                    (mf) => mf.formIndex === index && mf.field === "employeeId"
                  )
                    ? "error"
                    : ""
                }
                required
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor={`date-${index}`}>날짜:</Label>
              <Input
                type="date"
                name="date"
                id={`date-${index}`}
                value={formState.date}
                onChange={(e) => handleFormChange(index, e)}
                className={
                  missingFields.some(
                    (mf) => mf.formIndex === index && mf.field === "date"
                  )
                    ? "error"
                    : ""
                }
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor={`clockIn-${index}`}>출근 시간:</Label>
              <Input
                type="time"
                name="clockIn"
                id={`clockIn-${index}`}
                value={formState.clockIn}
                onChange={(e) => handleFormChange(index, e)}
                className={
                  missingFields.some(
                    (mf) => mf.formIndex === index && mf.field === "clockIn"
                  )
                    ? "error"
                    : ""
                }
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor={`clockOut-${index}`}>퇴근 시간:</Label>
              <Input
                type="time"
                name="clockOut"
                id={`clockOut-${index}`}
                value={formState.clockOut}
                onChange={(e) => handleFormChange(index, e)}
                className={
                  missingFields.some(
                    (mf) => mf.formIndex === index && mf.field === "clockOut"
                  )
                    ? "error"
                    : ""
                }
                required
              />
              {calculateWorkHours(formState) !== null && (
                <WorkHours>
                  근무 시간: {calculateWorkHours(formState)}시간
                </WorkHours>
              )}
            </FormGroup>
            <DeleteFormButton onClick={() => removeForm(index)}>
              삭제
            </DeleteFormButton>
          </Form>
        ))}
        <ButtonContainer>
          <AddButton onClick={addForm}>+ 추가</AddButton>
          {formStates.length > 1 && (
            <>
              <BulkButton onClick={applyBulk}>일괄 추가</BulkButton>
              <TooltipContainer>
                <InfoIcon>i</InfoIcon>
                <Tooltip>
                  일괄 추가 버튼은 맨 상단에 있는 날짜, 출근 시간, 퇴근 시간을
                  그대로 추가합니다
                </Tooltip>
              </TooltipContainer>
            </>
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            style={{ marginTop: "0" }}
          >
            {currentSchedule
              ? "스케줄 수정"
              : formStates.length > 1
              ? "스케줄 추가하기"
              : "스케줄 추가하기"}
          </Button>
        </ButtonContainer>
      </FormContainer>

      <Title>등록된 스케줄</Title>
      <FilterContainer>
        <FilterLabel>직원 필터:</FilterLabel>
        <Select
          value={selectedEmployee}
          onChange={(e) => {
            setSelectedEmployee(e.target.value);
            console.log("Filter changed to:", e.target.value);
          }}
          disabled={employees.length === 0}
        >
          <option value="all">모두 보기</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </Select>
      </FilterContainer>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>직원</th>
              <th>날짜</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>근무 시간</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td>
                  {employees.find((emp) => emp.id === schedule.employeeId)
                    ?.name || schedule.employeeId}
                </td>
                <td>{schedule.date}</td>
                <td>{schedule.clockIn}</td>
                <td>{schedule.clockOut}</td>
                <td>{calculateWorkHoursForSchedule(schedule)}</td>
                <td>
                  <ActionButton edit onClick={() => handleEdit(schedule)}>
                    수정
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(schedule.id)}>
                    삭제
                  </ActionButton>
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
