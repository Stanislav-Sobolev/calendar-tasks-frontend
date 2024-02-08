import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Board } from './Components/Board/Board';
import boardEmptyTemplate from './assets/json/boardEmptyTemplate.json';
import { createBoard, deleteBoard, getBoardById, updateBoardName } from './helpers/fetchers';

import styles from './App.module.scss';
import { Cross, Ok } from './Components/Icons';

export const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBoard, setFilteredBoard] = useState(null);
  const [nameBoard, setNameBoard] = useState('');
  
  const [idBoardCreating, setIdBoardCreating] = useState('');
  const [nameBoardCreating, setNameBoardCreating] = useState('');
  const [changedBoardName, setChangedBoardName] = useState('');
  const [actualInputValue, setActualInputValue] = useState('');
  const [actualInputPlaceholder, setActualInputPlaceholder] = useState('');
  

  useEffect(() => {
    fetchBoard('1');
  // eslint-disable-next-line
  }, []);

  const fetchBoard = async (defaultBoardId) => {
    try {
      const boardId = defaultBoardId ?? searchTerm;
      
      const fetchedBoard = await getBoardById(boardId);
    
      if (fetchedBoard) {
        setFilteredBoard(fetchedBoard);
        setNameBoard(fetchedBoard.name);
        setChangedBoardName(fetchedBoard.name);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const failFetchCallback = () => {
    toast.error('Sorry, try again');
    fetchBoard();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

 
  return (
    <div className={styles.app}>
      <ToastContainer />
      <div className={styles.searchPanel}>
      </div>
      { filteredBoard && 
      <Board 
        boardData={filteredBoard}
        setBoardData={setFilteredBoard}
        nameBoard={nameBoard}
        failFetchCallback={failFetchCallback}
      />}
    </div>
  );
};
