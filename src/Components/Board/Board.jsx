import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card } from '../Card/Card';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from './Board.module.scss';
import { Plus } from '../Icons';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok, Cross } from '../Icons';

export const Board = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, columnsData } = boardData;

  const [columns, setColumns] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    setColumns(columnsData);
  }, [columnsData]);
  
  const dragOverHandler = (e) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e, column) => {
    e.preventDefault();
    
    if (currentCard && currentColumn && columns && hoveredCard) {
      const dropIndex = column.items.indexOf(hoveredCard);
      
      setBoardData((board) => {
        if (board) {
          
          const columnFrom = board.columnsData.find((col) => col.id === currentColumn.id);
          const columnTo = board.columnsData.find((col) => col.id === column.id);
          
          if (columnFrom && columnTo) {
            const currentCardIndex = columnFrom.items.indexOf(currentCard);
            columnFrom.items.splice(currentCardIndex, 1);

            columnTo.items.splice(dropIndex + 1, 0, currentCard);
            
            return {...board};
          }
        }
        return board;
      });

      
      dndCard(boardId, currentColumn.id, currentCard.id, column.id, dropIndex + 1, failFetchCallback);
    }

    const target = e.target;
    target.style.boxShadow = 'none';
  };

  const addCardHandler = (column) => {
    setActiveColumn(column);
    setIsShowModal(true);
  }

  const cancelHandler = () => {
    setTitle('');
    setDescription('');
    setIsShowModal(false);
    setActiveColumn(null);
  }

  const saveUpdateHandler = () => {
    const createdCard = { ...cardEmptyTemplate, id: Date.now(), title, description };

    if (activeColumn && title && description) {
      setBoardData((board) => {
        if (board) {
          
          const foundColumn = board.columnsData.find((col) => col.id === activeColumn.id);
          
          if (foundColumn) {
            foundColumn.items.push(createdCard);
            
            return {...board};
          }
        }
        return board;
      });
  
      createCard(boardId, activeColumn.id, createdCard, failFetchCallback);
      cancelHandler();
    } else {
      toast.error('Please, fill Title, Description');
    }
  }

  const renderModal = () => (
    <>
    <div className={styles.modalOverlay}>
    <div className={styles.modalWrapper}>
      <input
        className={styles.cardTextInput}
        type="text"
        value={title}
        placeholder='title'
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className={styles.cardDescriptionInput}
        type="text"
        value={description}
        placeholder='description'
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className={styles.iconWrapper}>
      <div onClick={cancelHandler}>
        <Cross className={styles.crossIcon}/>
      </div>
      <div onClick={saveUpdateHandler}>
        <Ok className={styles.okIcon} />
      </div>
      </div>
      </div>
    </div>
    </>
  );

  return (
    <div className={styles.board}>
      <h1 className={styles.boardName}>{nameBoard}</h1>
      { isShowModal ? renderModal() : null}
      <div className={styles.columns}>
        {columns && columns.map(column => 
          <div key={column.id} className={styles.columnWrapper}>
            <h2 className={styles.columnTitle}>{column.title}</h2>
            <div 
              key={column.id}
              className={styles.column}
              onDragOver={(e) => dragOverHandler(e)}
              onDrop={(e) => dropCardHandler(e, column)}
            >
              
              {column.items.map(item => (
                <Card 
                  key={item.id}
                  card={item} 
                  column={column}
                  boardId={boardId}
                  failFetchCallback={failFetchCallback}
                  setCurrentColumn={setCurrentColumn}
                  setCurrentCard={setCurrentCard}
                  setHoveredCard={setHoveredCard}
                  setColumns={setColumns}
                  setBoardData={setBoardData}
                />
              ))}
              <div 
                className={styles.plusWrapper}
                onClick={() => addCardHandler(column)}
              >
                <Plus className={styles.plusIcon}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
