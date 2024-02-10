import React from 'react';
import styled from 'styled-components';
import { Card } from '../Card/Card';
import { Plus as PlusIcon } from '../Icons';

const Cell = styled.div`
  width: 100%;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #ccc;
  overflow-y: auto;
  background-color: ${(props) => (props.$isOutsideMonth ? '#f5f5f5' : 'white')};
`;

const DateWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 6px;
`;

const CardsList = styled.ul`
  width: 100%;
`;

const CardsCount = styled.span`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-left: 6px;
  color: var(--disabled);
`;

const PlusWrapper = styled.div`
  margin-top: auto;
  cursor: pointer;

  &:hover {
    .plusIcon path {
      fill: var(--accent);
    }
  }
`;

const Plus = styled(PlusIcon)`
  path {
    fill: var(--disabled);
    transition: fill 0.3s ease;
  }

  ${PlusWrapper}:hover & {
    path {
      fill: var(--accent);
    }
  }
`;

const DayCell = (props) => {
  const { 
    day, 
    cellId,
    boardId, 
    currentCell, 
    dragOverHandler, 
    dropCardHandler, 
    failFetchCallback,
    setCurrentCell,
    setCurrentCard,
    setHoveredCard,
    setBoardData,
    addCardHandler,
    ...restProps
  } = props;

    return (
    <Cell
      {...restProps}
      onDragOver={(e) => dragOverHandler(e)}
      onDrop={(e) => dropCardHandler(e, cellId)}
    >
      <DateWrapper>
        <span>{day}</span>
        {currentCell?.items.length && (
          <CardsCount>
            {currentCell.items.length}
            {currentCell.items.length > 1 ? ' cards' : ' card'}
          </CardsCount>
        )}
      </DateWrapper>
      <CardsList>
        {currentCell && currentCell.items.length ? (
          <>
            {currentCell.items.map((item) => (
              <Card
                key={item.id}
                card={item}
                cell={currentCell}
                boardId={boardId}
                failFetchCallback={failFetchCallback}
                setCurrentCell={setCurrentCell}
                setCurrentCard={setCurrentCard}
                setHoveredCard={setHoveredCard}
                setBoardData={setBoardData}
              />
            ))}
          </>
        ) : null}
      </CardsList>
      <PlusWrapper onClick={() => addCardHandler(cellId)}>
        <Plus />
      </PlusWrapper>
    </Cell>
  );
};

export default DayCell;
