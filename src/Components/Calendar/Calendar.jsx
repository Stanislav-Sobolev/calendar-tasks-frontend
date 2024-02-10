import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import DayCell from '../DayCell/DayCell';
import { toast } from 'react-toastify';
import cardEmptyTemplate from '../../assets/json/cardEmptyTemplate.json';
import styles from './Calendar.module.scss';
import { createCard, dndCard } from '../../helpers/fetchers';
import { Ok, Cross } from '../Icons';

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 190px);
`;

const Calendar = ({boardData, nameBoard, failFetchCallback, setBoardData}) => {
  const { id: boardId, cellsData } = boardData;

  const [days, setDays] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeCellId, setActiveCellId] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment());

  const refCurrentCard = useRef();
  const refCurrentCell  = useRef();
  const refHoveredCard  = useRef();
  refCurrentCard.current = currentCard;
  refCurrentCell.current = currentCell;
  refHoveredCard.current = hoveredCard;

  useEffect(() => {
    if (cellsData) {
      const startOfMonth = moment(selectedDate).startOf('month');
      const endOfMonth = moment(selectedDate).endOf('month');
      const startDate = moment(startOfMonth).startOf('week');
      const endDate = moment(endOfMonth).endOf('week');

      const countedDays = [];
      let currentDate = startDate;
      
      const cellsRange = cellsData.filter(el => moment(el.id).isSameOrAfter(startDate.unix()) && moment(el.id).isSameOrBefore(endDate.unix()))
      
      while (currentDate.isSameOrBefore(endDate)) {
        const isOutsideMonth = !currentDate.isBetween(startOfMonth, endOfMonth, null, '[]');
        const currentCellData = cellsRange.find(el => moment.unix(el.id).format('YMD') === currentDate.format('YMD'));

        countedDays.push(
          <DayCell
            key={currentDate.format('YYYY-MM-DD')}
            day={currentDate.format('D')}
            cellId={currentDate.unix()}
            $isOutsideMonth={isOutsideMonth}
            boardId={boardId}
            currentCell={currentCellData}
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
  }, [cellsData, boardData, selectedDate]);



  useEffect(() => {
    moment.locale('en'); // Set the desired default locale
  }, []);

  const dragOverHandler = (e) => {
    e.preventDefault();
  };

  const dropCardHandler = async (e, cellId) => {
    e.preventDefault();
    
    if (refCurrentCard.current && refCurrentCell.current && cellsData) {
      let dropIndex = 0;

      if (refHoveredCard.current) {
        const cellToDrop = cellsData.find(el => el.id === cellId);
        const isCardExist = cellToDrop ? cellToDrop.items.indexOf(refHoveredCard.current) : -1;
        dropIndex = isCardExist !== -1 ? isCardExist : 0;
      }

      setBoardData((board) => {
        if (board) {
          let cellFrom = board.cellsData.find((col) => col.id === refCurrentCell.current.id);
          let cellTo = board.cellsData.find((col) => col.id === cellId);

          if (!cellTo) {
            const newCell = {"title": "day", "items": [], id: cellId}
            board.cellsData.push(newCell)
            cellTo = board.cellsData.find((col) => col.id === cellId);
          }
          
          if (cellFrom && cellTo) {
            const currentCardIndex = cellFrom.items.indexOf(refCurrentCard.current);
            cellFrom.items.splice(currentCardIndex, 1);
            cellFrom.items = [...cellFrom.items]
            
            cellTo.items.splice(dropIndex + 1, 0, refCurrentCard.current);
            cellTo.items = [...cellTo.items]
            
            return {...board};
          }
        }
        return board;
      });

      
      dndCard(boardId, refCurrentCell.current.id, refCurrentCard.current.id, cellId, dropIndex + 1, failFetchCallback);
    }

    const target = e.target;
    target.style.boxShadow = 'none';
  };

  const addCardHandler = (cellId) => {
    setActiveCellId(cellId);
    setIsShowModal(true);
  }

  const cancelHandler = () => {
    setTitle('');
    setDescription('');
    setIsShowModal(false);
    setActiveCellId(null);
  }

  const saveUpdateHandler = () => {
    const createdCard = { ...cardEmptyTemplate, id: Date.now(), title, description };

    if (activeCellId && title && description) {
      setBoardData((board) => {
        if (board) {
          let foundCell = board.cellsData.find((col) => col.id === activeCellId);

          if (!foundCell) {
            const newCell = {"title": "day", "items": [], id: activeCellId}
            board.cellsData.push(newCell)
            foundCell = board.cellsData.find((col) => col.id === activeCellId);
          }
          
          if (foundCell) {
            foundCell.items.push(createdCard);
            
            return {...board};
          }
        }
        return board;
      });
  
      createCard(boardId, activeCellId, createdCard, failFetchCallback);
      cancelHandler();
    } else {
      toast.error('Please, fill Title, Description');
    }
  };

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
      { isShowModal ? renderModal() : null}
      <CalendarContainer>{days}</CalendarContainer>
    </div>
  );
};

export default Calendar;
