
import React, { useState, useCallback, useEffect } from 'react';
import { ROWS, COLS, DEFAULT_CELL_COLOR, THEMES } from './constants';
import { GridData, GridCell as IGridCell } from './types';
import GridCell from './components/GridCell';
import { generateGridContent, analyzeGrid } from './services/gemini';
import { 
  Sparkles, 
  Trash2, 
  Search, 
  LayoutGrid, 
  Info, 
  Download,
  CheckCircle2,
  Loader2,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridData>([]);
  const [loading, setLoading] = useState(false);
  const [themeInput, setThemeInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

  // Initialize Grid
  const initializeGrid = useCallback(() => {
    const newGrid: GridData = [];
    for (let r = 0; r < ROWS; r++) {
      const row: IGridCell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          id: `${r}-${c}`,
          value: '',
          color: DEFAULT_CELL_COLOR,
          intensity: 100
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initializeGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
  };

  const updateCell = (r: number, c: number, updates: Partial<IGridCell>) => {
    const newGrid = [...grid];
    newGrid[r][c] = { ...newGrid[r][c], ...updates };
    setGrid(newGrid);
  };

  const handleAIRequest = async (theme?: string) => {
    const targetTheme = theme || themeInput;
    if (!targetTheme) return;

    setLoading(true);
    setAnalysis('');
    const aiGrid = await generateGridContent(targetTheme);
    if (aiGrid) {
      const formattedGrid: GridData = aiGrid.map((row: any, r: number) => 
        row.map((cell: any, c: number) => ({
          id: `${r}-${c}`,
          value: cell.value,
          color: cell.color,
          intensity: cell.intensity
        }))
      );
      setGrid(formattedGrid);
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeGrid(grid);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const clearGrid = () => {
    initializeGrid();
    setAnalysis('');
    setSelectedCell(null);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(grid));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "grid_matrix_96.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Matrix96</h1>
            <p className="text-slate-400 text-sm">Interactive 9x6 Neural Canvas</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={clearGrid}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium border border-slate-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium border border-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Tools & Settings */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">AI Generator</h2>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter theme (e.g. Synthwave)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-10"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAIRequest()}
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(t => (
                <button
                  key={t}
                  onClick={() => { setThemeInput(t); handleAIRequest(t); }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-400 hover:text-white transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleAIRequest()}
              disabled={loading || !themeInput}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span>{loading ? 'Synthesizing...' : 'Generate Matrix'}</span>
            </button>
          </section>

          {/* Analysis View */}
          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2 text-emerald-400">
                <Info className="w-5 h-5" />
                <h2 className="font-bold uppercase tracking-wider text-xs">Insight Engine</h2>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
                Analyze Patterns
              </button>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 min-h-[100px] relative">
              {analysis ? (
                <p className="text-slate-300 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                  {analysis}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm space-y-2 py-4">
                  <p>No active analysis.</p>
                  <p className="text-[10px]">Populate the grid to see patterns.</p>
                </div>
              )}
            </div>
          </section>

          {/* Active Cell Editor */}
          {selectedCell && (
            <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 space-y-4 animate-in slide-in-from-left-2">
              <div className="flex items-center justify-between text-yellow-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50"></div>
                  <h2 className="font-bold uppercase tracking-wider text-xs">Cell Editor [{selectedCell.c + 1}, {selectedCell.r + 1}]</h2>
                </div>
                <button onClick={() => setSelectedCell(null)} className="text-slate-500 hover:text-white">&times;</button>
              </div>
              
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs text-slate-400 block mb-1">Value</span>
                  <input 
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                    value={grid[selectedCell.r][selectedCell.c].value}
                    onChange={(e) => updateCell(selectedCell.r, selectedCell.c, { value: e.target.value })}
                  />
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs text-slate-400 block mb-1">Color</span>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color"
                        className="w-10 h-10 bg-transparent border-none cursor-pointer"
                        value={grid[selectedCell.r][selectedCell.c].color}
                        onChange={(e) => updateCell(selectedCell.r, selectedCell.c, { color: e.target.value })}
                      />
                      <span className="text-[10px] font-mono uppercase text-slate-500">{grid[selectedCell.r][selectedCell.c].color}</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-400 block mb-1">Intensity ({grid[selectedCell.r][selectedCell.c].intensity}%)</span>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      value={grid[selectedCell.r][selectedCell.c].intensity}
                      onChange={(e) => updateCell(selectedCell.r, selectedCell.c, { intensity: parseInt(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            </section>
          )}
        </aside>

        {/* Right Column: The Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
            {/* Grid Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <LayoutGrid className="w-48 h-48 rotate-12" />
            </div>

            {/* X Axis Labels */}
            <div className="ml-8 mb-4 flex relative z-10">
               <div 
                className="grid gap-2 md:gap-3 w-full"
                style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: COLS }).map((_, i) => (
                  <div key={`x-${i}`} className="text-center text-[10px] font-mono text-slate-500 font-bold uppercase tracking-tighter">
                    X={i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex relative z-10">
              {/* Y Axis Labels */}
              <div 
                className="grid gap-2 md:gap-3 mr-4"
                style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: ROWS }).map((_, i) => (
                  <div key={`y-${i}`} className="flex items-center text-[10px] font-mono text-slate-500 font-bold uppercase whitespace-nowrap">
                    Y={i + 1}
                  </div>
                ))}
              </div>

              {/* Grid Content */}
              <div 
                className="grid gap-2 md:gap-3 flex-1"
                style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
              >
                {grid.map((row, r) => 
                  row.map((cell, c) => (
                    <GridCell 
                      key={cell.id} 
                      cell={cell} 
                      row={r}
                      col={c}
                      onClick={() => handleCellClick(r, c)}
                      onMouseEnter={() => {}} 
                    />
                  ))
                )}
              </div>
            </div>

            {/* Grid Legend */}
            <div className="mt-8 pt-6 border-t border-slate-700 flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono gap-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                  <span>Dimensions: 9 Columns (X) &times; 6 Rows (Y)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Status: Operational</span>
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-900 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Synchronized with Gemini-3</span>
              </div>
            </div>
          </div>
          
          {/* Quick Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 flex items-start space-x-3">
              <div className="text-blue-500 mt-1"><Sparkles className="w-4 h-4" /></div>
              <p className="text-[11px] text-slate-400">Type a theme and hit generate to see the AI dream up a 9x6 layout for you.</p>
            </div>
            <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 flex items-start space-x-3">
              <div className="text-yellow-500 mt-1"><LayoutGrid className="w-4 h-4" /></div>
              <p className="text-[11px] text-slate-400">Click any individual cell to manually override its value, color, or opacity.</p>
            </div>
            <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 flex items-start space-x-3">
              <div className="text-emerald-500 mt-1"><Search className="w-4 h-4" /></div>
              <p className="text-[11px] text-slate-400">Use the Insight Engine to extract deep patterns and narratives from your grid.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-8 text-slate-500 text-xs border-t border-slate-800 mt-auto">
        <p>&copy; 2024 Matrix96 Engineering. Powered by Gemini Generative AI.</p>
      </footer>
    </div>
  );
};

export default App;
