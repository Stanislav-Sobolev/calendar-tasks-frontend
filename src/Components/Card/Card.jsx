import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

import { Edit, Delete, Ok, Cross } from '../Icons';
import { deleteCard, updateCard } from '../../helpers/fetchers';

import styles from './Card.module.scss';

export const Card = ({ card, cell, boardId, failFetchCallback, setCurrentCell, setCurrentCard, setHoveredCard, setBoardData }) => {
  const { id: cardId } = card;
  const { id: cellId } = cell;

  const [title, setTitle] = useState(card.title);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [isEditing, setEditing] = useState(false);

  const classNamesToStyle = [styles.card, styles.cardDescription, styles.cardTitle, styles.iconWrapper, styles.editIcon, styles.deleteIcon];
  const elementRef = useRef(null);

  const dragStartHandler = (cell) => {
    setCurrentCell(cell);
    setCurrentCard(card);
  }

  const dragLeaveHandler = () => {
    if (elementRef.current) {
      elementRef.current.style.boxShadow = 'none';
    }
  };

  const dragOverHandler = (e) => {
    e.preventDefault();
    const target = e.target;

    // console.log("elementRef", elementRef.current);
    // console.log("classNamesToStyle.includes(target.className)", classNamesToStyle.includes(target.className));

    if (classNamesToStyle.includes(target.className) && elementRef.current) {
      console.log('!!!!!!555555555555555555', card)
      setHoveredCard(card);
      elementRef.current.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
    }
  }

  const dropHandler = () => {
    if (elementRef.current) {
      elementRef.current.style.boxShadow = 'none';
    }
  }

  const editHandler = () => {
    setOriginalTitle(title);
    setOriginalDescription(description);
    setEditing(true);
  }

  const saveUpdateCardHandler = async () => {
    if (title && description) {
      setBoardData(board => {
        if (board) {
          
          const cell = board.cellsData.find((col) => col.id === cellId);
          
          if (cell) {
            const cardIndex = cell.items.findIndex((c) => c.id === cardId);
  
            if (cardIndex !== -1) {
              cell.items[cardIndex] = { title, description };
              return {...board};
            }
          }
        }
        return board;
      });
  
      updateCard(boardId, cellId, cardId, {id: cardId, title, description}, failFetchCallback);
  
      setEditing(false);
    } else {
      toast.error('Please, fill Title, Description and CalendarDate');
    }
  }

  const cancelHandler = () => {
    setTitle(originalTitle);
    setDescription(originalDescription);
    setEditing(false);
  }

  const deleteHandler = async () => {
    setBoardData((board) => {
      if (board) {
        
        const cell = board.cellsData.find((col) => col.id === cellId);
        
        if (cell) {
          const cardIndex = cell.items.findIndex((c) => c.id === cardId);

          if (cardIndex !== -1) {
            cell.items.splice(cardIndex, 1);
            return {...board};
          }
        }
      }
      return board;
    });

    deleteCard(boardId, cellId, cardId, failFetchCallback);
  }

  const renderContent = () => isEditing ? (
    <>
      <div className={styles.editWrapper}>
        <input
          className={styles.cardTitleInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={styles.cardDescriptionInput}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className={styles.iconWrapper}>
          <div onClick={cancelHandler}>
            <Cross className={styles.crossIcon}/>
          </div>
          <div onClick={saveUpdateCardHandler}>
            <Ok className={styles.okIcon} />
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardDescription}>{description}</span>
      <div className={styles.bottomWrapper}>
        <div className={styles.iconWrapper}>
          <div onClick={editHandler}>
            <Edit className={styles.editIcon} />
          </div>
          <div onClick={deleteHandler}>
            <Delete className={styles.deleteIcon} />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <li
      ref={elementRef}
      className={styles.card}
      draggable={!isEditing}
      onDragStart={() => dragStartHandler(cell)}
      onDragLeave={dragLeaveHandler}
      onDragEnd={dragLeaveHandler}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
    >
      {renderContent()}
    </li>
  );
};
