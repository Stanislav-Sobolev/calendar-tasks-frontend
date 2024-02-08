import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card } from '../Card/Card';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from './Board.module.scss';
import { Plus } from '../Icons';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok, Cross } from '../Icons';

export const Board = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, cellsData } = boardData;

  const [cells, setCells] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    setCells(cellsData);
  }, [cellsData]);
  
  const dragOverHandler = (e) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e, cell) => {
    e.preventDefault();
    
    if (currentCard && currentCell && cells && hoveredCard) {
      const dropIndex = cell.items.indexOf(hoveredCard);
      
      setBoardData((board) => {
        if (board) {
          
          const cellFrom = board.cellsData.find((col) => col.id === currentCell.id);
          const cellTo = board.cellsData.find((col) => col.id === cell.id);
          
          if (cellFrom && cellTo) {
            const currentCardIndex = cellFrom.items.indexOf(currentCard);
            cellFrom.items.splice(currentCardIndex, 1);

            cellTo.items.splice(dropIndex + 1, 0, currentCard);
            
            return {...board};
          }
        }
        return board;
      });

      
      dndCard(boardId, currentCell.id, currentCard.id, cell.id, dropIndex + 1, failFetchCallback);
    }

    const target = e.target;
    target.style.boxShadow = 'none';
  };

  const addCardHandler = (cell) => {
    setActiveCell(cell);
    setIsShowModal(true);
  }

  const cancelHandler = () => {
    setTitle('');
    setDescription('');
    setIsShowModal(false);
    setActiveCell(null);
  }

  const saveUpdateHandler = () => {
    const createdCard = { ...cardEmptyTemplate, id: Date.now(), title, description };

    if (activeCell && title && description) {
      setBoardData((board) => {
        if (board) {
          
          const foundCell = board.cellsData.find((col) => col.id === activeCell.id);
          
          if (foundCell) {
            foundCell.items.push(createdCard);
            
            return {...board};
          }
        }
        return board;
      });
  
      createCard(boardId, activeCell.id, createdCard, failFetchCallback);
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
      <div className={styles.cells}>
        {cells && cells.map(cell => 
          <div key={cell.id} className={styles.cellWrapper}>
            <h2 className={styles.cellTitle}>{cell.title}</h2>
            <div 
              key={cell.id}
              className={styles.cell}
              onDragOver={(e) => dragOverHandler(e)}
              onDrop={(e) => dropCardHandler(e, cell)}
            >
              
              {cell.items.map(item => (
                <Card 
                  key={item.id}
                  card={item} 
                  cell={cell}
                  boardId={boardId}
                  failFetchCallback={failFetchCallback}
                  setCurrentCell={setCurrentCell}
                  setCurrentCard={setCurrentCard}
                  setHoveredCard={setHoveredCard}
                  setCells={setCells}
                  setBoardData={setBoardData}
                />
              ))}
              <div 
                className={styles.plusWrapper}
                onClick={() => addCardHandler(cell)}
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
