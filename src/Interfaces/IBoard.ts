import {ICell} from './ICell'

export interface IBoard { 
    id: string; 
    name: string; 
    cellsData: ICell[]; 
}