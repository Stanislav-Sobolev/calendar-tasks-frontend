import React from 'react';
import styled from 'styled-components';

const Cell = styled.div`
  width: 100%;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  background-color: ${(props) => (props.$isOutsideMonth ? '#f5f5f5' : 'white')};
`;

const DayCell = (props) => {
  const { day, ...restProps } = props;
  return <Cell {...restProps}>{day}</Cell>;
};

export default DayCell;
