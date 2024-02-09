import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import DayCell from '../DayCell/DayCell';

import { toast } from 'react-toastify';
import { Card } from '../Card/Card';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from '../Board/Board.module.scss';
import { Plus } from '../Icons';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok, Cross } from '../Icons';

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 180px);
`;

const Calendar = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, cellsData } = boardData;

  const [cells, setCells] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment());

  useEffect(() => {
    setCells(cellsData);
  }, [cellsData]);



  useEffect(() => {
    moment.locale('en'); // Set the desired default locale
  }, []);

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


  const startOfMonth = moment(selectedDate).startOf('month');
  const endOfMonth = moment(selectedDate).endOf('month');
  const startDate = moment(startOfMonth).startOf('week');
  const endDate = moment(endOfMonth).endOf('week');

console.log('startOfMonth', startOfMonth.valueOf());
console.log('startDate', startDate.valueOf());

  const days = [];
  let currentDate = startDate;

  while (currentDate.isSameOrBefore(endDate)) {
    const isOutsideMonth = !currentDate.isBetween(startOfMonth, endOfMonth, null, '[]');
    days.push(
      <DayCell
        key={currentDate.format('YYYY-MM-DD')}
        day={currentDate.format('D')}
        $isOutsideMonth={isOutsideMonth}
      />
    );
    currentDate.add(1, 'days');
  }




//  <div className={styles.board}>
//       <h1 className={styles.boardName}>{nameBoard}</h1>
//       { isShowModal ? renderModal() : null}
//       <div className={styles.cells}>
//         {cells && cells.map(cell => 
//           <div key={cell.id} className={styles.cellWrapper}>
//             <h2 className={styles.cellTitle}>{cell.title}</h2>
//             <div 
//               key={cell.id}
//               className={styles.cell}
//               onDragOver={(e) => dragOverHandler(e)}
//               onDrop={(e) => dropCardHandler(e, cell)}
//             >
              
//               {cell.items.map(item => (
//                 <Card 
//                   key={item.id}
//                   card={item} 
//                   cell={cell}
//                   boardId={boardId}
//                   failFetchCallback={failFetchCallback}
//                   setCurrentCell={setCurrentCell}
//                   setCurrentCard={setCurrentCard}
//                   setHoveredCard={setHoveredCard}
//                   setCells={setCells}
//                   setBoardData={setBoardData}
//                 />
//               ))}
//               <div 
//                 className={styles.plusWrapper}
//                 onClick={() => addCardHandler(cell)}
//               >
//                 <Plus className={styles.plusIcon}/>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>




  return (
    <div>
      <div>
        <button onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'month'))}>
          Previous Month
        </button>
        {selectedDate.format('MMMM YYYY')}
        <button onClick={() => setSelectedDate(moment(selectedDate).add(1, 'month'))}>
          Next Month
        </button>
      </div>
      <CalendarContainer>{days}</CalendarContainer>
    </div>
  );
};

export default Calendar;
