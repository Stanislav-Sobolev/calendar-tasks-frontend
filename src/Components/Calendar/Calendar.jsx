import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import DayCell from '../DayCell/DayCell';
import { toast } from 'react-toastify';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from '../Board/Board.module.scss';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok, Cross } from '../Icons';

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 190px);
`;

const Calendar = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, cellsData } = boardData;

  const [cells, setCells] = useState(null);
  const [days, setDays] = useState([]);
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
    if (cells) {
      const startOfMonth = moment(selectedDate).startOf('month');
      const endOfMonth = moment(selectedDate).endOf('month');
      const startDate = moment(startOfMonth).startOf('week');
      const endDate = moment(endOfMonth).endOf('week');

      const countedDays = [];
      let currentDate = startDate;
      
      const cellsRange = cells.filter(el => (el.id >= startDate.valueOf()) && (el.id <= endDate.valueOf()))
          // console.log("currentCard22", currentCard)
          // console.log("currentCell22", currentCell)
          // console.log("cells22", cells)
          // console.log("hoveredCard22", hoveredCard)

      while (currentDate.isSameOrBefore(endDate)) {
        const isOutsideMonth = !currentDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        const currentCell = cellsRange.find(el => moment(el.id).format('YMD') === currentDate.format('YMD'));

        countedDays.push(
          <DayCell
            key={currentDate.format('YYYY-MM-DD')}
            day={currentDate.format('D')}
            cellId={currentDate.valueOf()}
            $isOutsideMonth={isOutsideMonth}
            boardId={boardId}
            currentCell={currentCell}
            dragOverHandler={dragOverHandler}
            dropCardHandler={dropCardHandler}
            failFetchCallback={failFetchCallback}
            setCurrentCell={setCurrentCell}
            setCurrentCard={setCurrentCard}
            setHoveredCard={setHoveredCard}
            setBoardData={setBoardData}
            addCardHandler={addCardHandler}

          />
        );
        currentDate.add(1, 'days');
      }

      setDays(countedDays)
    }
  }, [cells]);



  useEffect(() => {
    moment.locale('en'); // Set the desired default locale
  }, []);

  const dragOverHandler = (e) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e, cellId) => {
    e.preventDefault();
    
    console.log("currentCard", currentCard)
    console.log("currentCell", currentCell)
    console.log("cells", cells)
    console.log("hoveredCard", hoveredCard)
    if (currentCard && currentCell && cells && hoveredCard) {
      
      let dropIndex = 0;
      if (hoveredCard) {
        console.log("hoveredCard !!!", hoveredCard)
        console.log("cells !!!", cells)
        const cellToDrop = cells.find(el => el.id === cellId);
        dropIndex = cellToDrop?.find(el => el.id === hoveredCard.id) || 0;
      }
      console.log("dropIndex !!!", dropIndex)
      // const dropIndex = cellId.items.indexOf(hoveredCard);
      
      setBoardData((board) => {
        if (board) {
          
          const cellFrom = cells.find((col) => col.id === currentCell.id);
          const cellTo = cells.find((col) => col.id === cellId);
          
          if (cellFrom && cellTo) {
            const currentCardIndex = cellFrom.items.indexOf(currentCard);
            cellFrom.items.splice(currentCardIndex, 1);

            cellTo.items.splice(dropIndex + 1, 0, currentCard);
            
            return {...board};
          }
        }
        return board;
      });

      
      dndCard(boardId, currentCell.id, currentCard.id, cellId, dropIndex + 1, failFetchCallback);
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
