
import React from 'react';
import { GridCell as IGridCell } from '../types';

interface Props {
  cell: IGridCell;
  row: number;
  col: number;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
}

const GridCell: React.FC<Props> = ({ cell, row, col, onClick, onMouseEnter }) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{ 
        backgroundColor: cell.color,
        opacity: cell.intensity / 100 + 0.2
      }}
      className="aspect-square flex items-center justify-center p-1 rounded-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 group relative border border-white/5"
    >
      <div className="flex flex-col items-center justify-center overflow-hidden w-full h-full">
        {cell.value ? (
          <span className="text-[10px] md:text-xs font-mono font-bold text-white truncate max-w-full drop-shadow-md">
            {cell.value}
          </span>
        ) : (
          <span className="text-[8px] font-mono text-white/30 select-none">
            {col + 1},{row + 1}
          </span>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-slate-900 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap border border-slate-700 pointer-events-none shadow-xl">
        <span className="text-blue-400 font-bold mr-1">[{col + 1}, {row + 1}]</span>
        {cell.value || 'Empty'}
      </div>
    </div>
  );
};

export default GridCell;
