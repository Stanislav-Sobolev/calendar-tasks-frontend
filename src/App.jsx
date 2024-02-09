import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Board } from './Components/Board/Board';
import { getBoardById } from './helpers/fetchers';

import styles from './App.module.scss';
import Calendar from './Components/Calendar/Calendar';

export const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchedBoard, setFetchedBoard] = useState(null);
  const [nameBoard, setNameBoard] = useState('');
  

  useEffect(() => {
    fetchBoard('1');
  // eslint-disable-next-line
  }, []);

  const fetchBoard = async (defaultBoardId) => {
    try {
      const boardId = defaultBoardId ?? searchTerm;
      
      const resBoard = await getBoardById(boardId);
    
      if (resBoard) {
        setFetchedBoard(resBoard);
        setNameBoard(resBoard.name);
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
      { fetchedBoard && 
      <Calendar 
        boardData={fetchedBoard}
        setBoardData={setFetchedBoard}
        nameBoard={nameBoard}
        failFetchCallback={failFetchCallback}
      />}
    </div>
  );
};
