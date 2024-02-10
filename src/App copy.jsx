import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBoardById } from './helpers/fetchers';

import Calendar from './Components/Calendar/Calendar';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
`;

const SearchPanel = styled.div`
  display: flex;
  padding: 10px;
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 700;
  padding: 6px;
`;

export const App = () => {
  const [searchTerm, setSearchTerm] = useState('1');
  const [fetchedBoard, setFetchedBoard] = useState(null);
  const [filteredBoard, setFilteredBoard] = useState(null);
  const [nameBoard, setNameBoard] = useState('');
  const [filterText, setFilterText] = useState('');
  

  useEffect(() => {
    fetchBoard('1');
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredBoard(fetchedBoard);
  // eslint-disable-next-line
  }, [fetchedBoard]);

  // useEffect(() => {
  //   if (fetchedBoard){
  //     setFilteredBoard(prev => {
  //       const filteredData = prev.cellsData.map(cell =>
  //         cell.items.filter(card => card.title.includes(filterText) || card.description.includes(filterText)));
        
  //         return filteredData;
  //     })
  //   }
  // }, [filterText]);

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

  return (
    <AppContainer>
      <ToastContainer />
      <SearchPanel >
        <StyledInput
          type="text"
          value={filterText}
          placeholder="title"
          onChange={(e) => setFilterText(e.target.value)}
        />
      </SearchPanel>
      { filteredBoard && 
      <Calendar 
        boardData={filteredBoard}
        setBoardData={setFetchedBoard}
        nameBoard={nameBoard}
        failFetchCallback={failFetchCallback}
      />}
    </AppContainer>
  );
};
