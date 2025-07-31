import React, { useState } from 'react';
import styled from 'styled-components';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 40px auto;

  @media (max-width: 768px) {
    padding: 30px 15px;
    margin: 20px auto;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 25px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
  }
`;

const Button = styled.button`
  padding: 12px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  margin-top: 10px;
  transition: background-color 0.2s;

  &:hover { background-color: #0056b3; }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 14px;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  margin-top: 15px;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const RadioContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    gap: 10px;
    font-size: 14px;
  }
`;

const ErrorText = styled.p`
  color: #dc3545;
  text-align: center;
  margin-top: 10px;
`;

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // Default role
  const [error, setError] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(role === 'manager' ? '/manager' : '/employee');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), { 
          email: user.email,
          role: role 
        });
        navigate(role === 'manager' ? '/manager' : '/employee');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <Title>{isLogin ? '로그인' : '회원가입'}</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {!isLogin && (
          <RadioContainer>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                value="employee" 
                checked={role === 'employee'} 
                onChange={(e) => setRole(e.target.value)} 
              />
              직원
            </RadioLabel>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                value="manager" 
                checked={role === 'manager'} 
                onChange={(e) => setRole(e.target.value)} 
              />
              사장님
            </RadioLabel>
          </RadioContainer>
        )}
        <Button type="submit">{isLogin ? '로그인' : '회원가입'}</Button>
      </Form>
      {error && <ErrorText>{error}</ErrorText>}
      <ToggleButton onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </ToggleButton>
    </Container>
  );
}

export default Login;