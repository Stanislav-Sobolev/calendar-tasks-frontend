import React from 'react';
import styled from 'styled-components';
import { Card } from '../Card/Card';
import styles from '../Card/Card.module.scss';
import { Plus } from '../Icons';

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
        <div className={styles.dateWrapper}>
          <span className={styles.day}>{day}</span>
          {currentCell?.items.length 
            ? <span className={styles.cardsCount}>{currentCell.items.length}{currentCell.items.length > 1 ? ' cards' : ' card'}</span>
            : null
          }  
        </div>    
        <ul 
          key={cellId}
          className={styles.cell}
          
        >
        {currentCell && currentCell.items.length ?
          <>
            {currentCell.items.map(item => (
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
          : null
        }
        </ul>
        <div 
          className={styles.plusWrapper}
          onClick={() => addCardHandler(cellId)}
        >
          <Plus className={styles.plusIcon}/>
        </div>
      </Cell>
    );
};

export default DayCell;
