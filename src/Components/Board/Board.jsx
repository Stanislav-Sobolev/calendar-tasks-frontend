import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FloatingLabel, Form } from 'react-bootstrap';
import { X, Check } from 'react-bootstrap-icons';

import Calendar from 'react-calendar';
import { Card } from '../Card/Card';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import { Plus } from '../Icons';
import { createCard, dndCard } from '../../helpers/fetchers';
import './Board.css';

export const Board = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, columnsData } = boardData;

  const [columns, setColumns] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
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
    setIsShowCalendar(true);
  }

  const cancelHandler = () => {
    setTitle('');
    setDescription('');
    setIsShowCalendar(false);
    setActiveColumn(null);
  }

  const saveUpdateHandler = () => {
    const createdCard = { ...cardEmptyTemplate, id: Date.now(), title, description, calendarDate: calendarDate.getTime() };

    if (activeColumn && title && description && calendarDate) {
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
      toast.error('Please, fill Title, Description and CalendarDate');
    }
  }

  const renderModal = () => (
    <>
    <div className="modalOverlay">
    <div className="modalWrapper">
      <FloatingLabel
          controlId="floatingInput"
          label='title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        >
          <Form.Control type="text"/>
        </FloatingLabel>
        <FloatingLabel 
          controlId="floatingPassword" 
          label='description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        >
          <Form.Control type="text"/>
        </FloatingLabel>
      <Calendar 
        onChange={setCalendarDate} 
        value={calendarDate}
        locale={'en-EN'}
      /> 
      <div className="iconWrapper">
      <div onClick={cancelHandler}>
        <X size={34} class="text-danger" bsClass="crossIcon"/>
      </div>
      <div onClick={saveUpdateHandler}>
        <Check size={34} class="text-success"/>
      </div>
      </div>
      </div>
    </div>
    </>
  );

  return (
    <div className="board">
      <h1 className="boardName">{nameBoard}</h1>
      { isShowCalendar ? renderModal() : null}
      <div className="columns">
        {columns && columns.map(column => 
          <div key={column.id} className="columnWrapper">
            <h2 className="columnTitle">{column.title}</h2>
            <div 
              key={column.id}
              className="column"
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
                className="plusWrapper"
                onClick={() => addCardHandler(column)}
              >
                <Plus className="plusIcon"/>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
