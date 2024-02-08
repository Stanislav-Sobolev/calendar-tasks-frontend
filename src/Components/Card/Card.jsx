import { useState } from 'react';
import { toast } from 'react-toastify';
import { FloatingLabel, Form } from 'react-bootstrap';
import { X, Check } from 'react-bootstrap-icons';


import Calendar from 'react-calendar';
import Moment from 'react-moment';
import { Edit, Delete } from '../Icons';
import { deleteCard, updateCard } from '../../helpers/fetchers';

import './Card.css';

export const Card = ({ card, column, boardId, failFetchCallback, setCurrentColumn, setCurrentCard, setHoveredCard, setColumns, setBoardData }) => {
  const { id: cardId } = card;
  const { id: columnId } = column;

  const [title, setTitle] = useState(card.title);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [isEditing, setEditing] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(card.calendarDate));

  const classNamesToStyle = ["card", "cardDescription", "cardTitle", "iconWrapper", "editIcon", "deleteIcon"];
  const elementById = document.getElementById(`${cardId}`);

  const dragStartHandler = (column) => {
    setCurrentColumn(column);
    setCurrentCard(card);
  }

  const dragLeaveHandler = (e) => {
    const target = e.target;
    
    if (classNamesToStyle.includes(target.className) && elementById) {
      elementById.style.boxShadow = 'none';
    }
  };
  

  const dragOverHandler = (e) => {
    e.preventDefault();
    const target = e.target;
    
    if (classNamesToStyle.includes(target.className) && elementById) {
      setHoveredCard(card);
      elementById.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
    }
  }

  const dropHandler = (e) => {
    e.preventDefault();
    const target = e.target;

    if (classNamesToStyle.includes(target.className) && elementById) {
      elementById.style.boxShadow = 'none';
    }
  }

  const editHandler = () => {
    setOriginalTitle(title);
    setOriginalDescription(description);
    setEditing(true);
  }

  const saveUpdateCardHandler = async () => {
    if (title && description && calendarDate) {
      console.log(title, description, calendarDate)
      setBoardData(board => {
        if (board) {
          
          const column = board.columnsData.find((col) => col.id === columnId);
          
          if (column) {
            const cardIndex = column.items.findIndex((c) => c.id === cardId);
  
            if (cardIndex !== -1) {
              column.items[cardIndex] = { title, description, calendarDate, id: cardId };
              return {...board};
            }
          }
        }
        return board;
      });
  
      updateCard(boardId, columnId, cardId, {id: cardId, title, description, calendarDate: calendarDate.getTime() }, failFetchCallback);
  
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
        
        const column = board.columnsData.find((col) => col.id === columnId);
        
        if (column) {
          const cardIndex = column.items.findIndex((c) => c.id === cardId);

          if (cardIndex !== -1) {
            column.items.splice(cardIndex, 1);
            return {...board};
          }
        }
      }
      return board;
    });

    deleteCard(boardId, columnId, cardId, failFetchCallback);
  }

  const renderContent = () => isEditing ? (
    <>
      <div className="editWrapper">
        <FloatingLabel label="Title">
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FloatingLabel>
        <FloatingLabel 
          label='description'
        >
          <Form.Control 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FloatingLabel>
        <Calendar 
          className="calendar"
          onChange={setCalendarDate} 
          value={calendarDate}
          locale={'en-EN'}
        /> 
        <div className="iconWrapper">
          <div onClick={cancelHandler}>
            <X size={34} class="text-danger"/>
          </div>
          <div onClick={saveUpdateCardHandler}>
            <Check size={34} class="text-success"/>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <span className="cardTitle">{title}</span>
      <span className="cardDescription">{description}</span>
      <div className="bottomWrapper">
        <Moment className="cardDate" format="DD.MM.YYYY">
          {calendarDate}
        </Moment>
        <div className="iconWrapper">
          <div onClick={editHandler}>
            <Edit className="editIcon" />
          </div>
          <div onClick={deleteHandler}>
            <Delete className="deleteIcon" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      id={`${cardId}`}
      className={isEditing ? "editedCard" : "card" }
      draggable={!isEditing}
      onDragStart={() => dragStartHandler(column)}
      onDragLeave={(e) => dragLeaveHandler(e)}
      onDragEnd={(e) => dragLeaveHandler(e)}
      onDragOver={(e) => dragOverHandler(e)}
      onDrop={(e) => dropHandler(e)}
    >
      {renderContent()}
    </div>
  );
};
