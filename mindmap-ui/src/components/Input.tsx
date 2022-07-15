import styled from 'styled-components';

const StyledInput = styled.input``;

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

const Input = ({ value, onChange }: InputProps) => {
  return <StyledInput />;
};

export default Input;
