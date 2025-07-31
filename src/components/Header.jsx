import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  width: 100%;
  padding: 20px 40px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #007bff;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Title>PayMate</Title>
    </HeaderContainer>
  );
}

export default Header;