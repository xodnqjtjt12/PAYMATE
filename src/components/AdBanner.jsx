import React from 'react';
import styled from 'styled-components';

const AdContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 15px;
  margin: 20px 0;
  background-color: #e3f2fd;
  border-radius: 12px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 10px;
    margin: 10px 0;
  }
`;

const AdLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #0d47a1; /* Darker blue text */
  font-weight: 600;
`;

const AdText = styled.p`
  margin: 0;
`;

function AdBanner() {
  return (
    <AdContainer>
      <AdLink href="https://www.google.com" target="_blank" rel="noopener noreferrer">
        <AdText>✨ 우리 동네 커피숍 10% 할인! 지금 바로 확인하세요!</AdText>
      </AdLink>
    </AdContainer>
  );
}

export default AdBanner;