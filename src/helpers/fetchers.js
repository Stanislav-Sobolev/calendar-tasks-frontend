import axios from "axios"

// axios.defaults.baseURL = 'https://dnd-te37.onrender.com';
axios.defaults.baseURL = 'http://localhost:4000/';

export const getBoardById = async (boardId) => {
    const res = await axios.get(`/board/${boardId}`);
    const boardData = res.data;
    
    return boardData;
};

export const createBoard = async (boardData) => {
    const res = await axios.post('/board', boardData);
    const board = res.data;
    
    return board;    
};

export const updateBoardName = async (boardId, name, failCallback) => {
  try {
    const res = await axios.put(`/board/${boardId}`, {name});
    const boardData = res.data;
    
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};

export const deleteBoard = async (boardId, failCallback) => {
  try {
    const res = await axios.delete(`/board/${boardId}`);
    const boardData = res.data;
    
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};

export const createCard = async (boardId, cellId, cardData, failCallback) => {
  try {
    const res = await axios.post(`/card/${boardId}/${cellId}`, cardData);
    const boardData = res.data;
      
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};

export const updateCard = async (boardId, cellId, cardId, updatedData, failCallback) => {
  try {
    const res = await axios.put(`/card/${boardId}/${cellId}/${cardId}`, updatedData);
    const boardData = res.data;
      
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  } 
};

export const dndCard = async (
    boardId, 
    cellId, 
    cardId,
    toCellId, 
    toCardIndexId,
    failCallback
    ) => {
      try {
        const res = await axios.patch(`/card/${boardId}/${cellId}/${cardId}/${toCellId}/${toCardIndexId}`);
        const boardData = res.data;
        
        return boardData;
      } catch (error) {
        failCallback && failCallback();
      }
};

export const deleteCard = async (boardId, cellId, cardId, failCallback) => {
  try {
    const res = await axios.delete(`/card/${boardId}/${cellId}/${cardId}`);
    const boardData = res.data;
    
    return boardData;
  } catch (error) {
    failCallback && failCallback();
  }
};
