import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const Section = styled.section`
  background-color: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 500px;
  margin: 20px auto;

  @media (max-width: 768px) {
    padding: 15px;
    margin: 15px auto;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
`;

const Status = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #555;
  margin-bottom: 25px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 20px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Button = styled.button`
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${(props) =>
    props.primary &&
    css`
      background-color: #007bff;
      color: white;
      &:hover {
        background-color: #0056b3;
      }
    `}

  ${(props) =>
    props.secondary &&
    css`
      background-color: #6c757d;
      color: white;
      &:hover {
        background-color: #5a6268;
      }
    `}

  &:disabled {
    background-color: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const InfoText = styled.p`
  font-size: 15px;
  color: #495057;
  text-align: center;
  margin-top: 20px;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-top: 15px;
  }
`;

const ErrorText = styled.p`
  color: #dc3545;
  text-align: center;
  margin-top: 15px;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;

const mockUser = { uid: "test-employee-id" };

function TimeTracker() {
  const [workStatus, setWorkStatus] = useState("출근 대기");
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [currentWorkRecordId, setCurrentWorkRecordId] = useState(null);
  const user = mockUser;

  useEffect(() => {
    const checkOngoingWork = async () => {
      if (!user) return;
      const q = query(
        collection(db, "workRecords"),
        where("employeeId", "==", user.uid),
        where("clockOutTime", "==", null)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const record = querySnapshot.docs[0];
        setCurrentWorkRecordId(record.id);
        setClockInTime(record.data().clockInTime.toDate());
        setWorkStatus("근무 중");
      }
    };
    checkOngoingWork();
  }, [user]);

  const handleClockIn = () => {
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const now = new Date();
        setClockInTime(now);
        setWorkStatus("근무 중");
        setClockOutTime(null);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);

        try {
          const docRef = await addDoc(collection(db, "workRecords"), {
            employeeId: user.uid,
            clockInTime: now,
            clockOutTime: null,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          setCurrentWorkRecordId(docRef.id);
        } catch (e) {
          setError("출근 기록 저장에 실패했습니다.");
        }
      },
      () =>
        setError("위치 정보 접근이 거부되었습니다. 위치 접근을 허용해주세요.")
    );
  };

  const handleClockOut = () => {
    if (!user || !currentWorkRecordId) {
      setError("출근 기록이 없습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const now = new Date();
        setClockOutTime(now);
        setWorkStatus("퇴근 완료");
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);

        try {
          const workRecordRef = doc(db, "workRecords", currentWorkRecordId);
          await updateDoc(workRecordRef, {
            clockOutTime: now,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          setCurrentWorkRecordId(null);
        } catch (e) {
          setError("퇴근 기록 저장에 실패했습니다.");
        }
      },
      () =>
        setError("위치 정보 접근이 거부되었습니다. 위치 접근을 허용해주세요.")
    );
  };

  return (
    <Section>
      <Title>출퇴근 기록</Title>
      <Status>상태: {workStatus}</Status>
      <ButtonContainer>
        <Button
          onClick={handleClockIn}
          primary="true"
          disabled={workStatus === "근무 중"}
        >
          출근하기
        </Button>
        <Button
          onClick={handleClockOut}
          secondary="true"
          disabled={workStatus !== "근무 중"}
        >
          퇴근하기
        </Button>
      </ButtonContainer>
      {error && <ErrorText>{error}</ErrorText>}
      {clockInTime && (
        <InfoText>
          출근 시간:{" "}
          {clockInTime.toLocaleString("ko-KR", {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
          일
        </InfoText>
      )}
      {clockOutTime && (
        <InfoText>
          퇴근 시간:{" "}
          {clockOutTime.toLocaleString("ko-KR", {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
          일
        </InfoText>
      )}
      {location && (
        <InfoText>
          위치 (위도, 경도): {location.latitude.toFixed(4)},{" "}
          {location.longitude.toFixed(4)}
        </InfoText>
      )}
    </Section>
  );
}

export default TimeTracker;
