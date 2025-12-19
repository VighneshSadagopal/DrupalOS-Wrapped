import React, { useState, useEffect } from 'react';
import { RotateCcw, Bot, User } from 'lucide-react';

interface TicTacToeProps {
  themeStyles: any;
  userAvatarUrl?: string;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ themeStyles, userAvatarUrl }) => {
  const [squares, setSquares] = useState<(string | null)[]>(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);
  const isGameOver = !!winner || isDraw;

  // Computer Turn Effect
  useEffect(() => {
    if (!isUserTurn && !isGameOver) {
      const timer = setTimeout(() => {
        const availableIndices = squares
          .map((val, idx) => (val === null ? idx : null))
          .filter((val) => val !== null) as number[];

        if (availableIndices.length > 0) {
          // Simple AI: Block immediate threat or random
          // For now, let's keep it random but prioritize center if available for a bit of challenge
          let moveIndex;
          
          if (availableIndices.includes(4)) {
             moveIndex = 4;
          } else {
             moveIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          }

          setSquares((prev) => {
            const next = [...prev];
            next[moveIndex] = 'O';
            return next;
          });
          setIsUserTurn(true);
        }
      }, 600); // Delay for realism

      return () => clearTimeout(timer);
    }
  }, [isUserTurn, isGameOver, squares]);

  const handleClick = (i: number) => {
    if (squares[i] || isGameOver || !isUserTurn) return;

    const nextSquares = [...squares];
    nextSquares[i] = 'X';
    setSquares(nextSquares);
    setIsUserTurn(false);
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setIsUserTurn(true);
  };

  // Determine button styles based on theme context
  const emptySquareClass = themeStyles.bg.includes('stone') 
    ? 'bg-stone-700 hover:bg-stone-600' 
    : 'bg-slate-100 hover:bg-slate-200';

  const getStatusMessage = () => {
    if (winner) {
      return winner === 'X' ? 'You Won! 🎉' : 'Computer Won 🤖';
    }
    if (isDraw) return "It's a Draw! 🤝";
    return isUserTurn ? 'Your Turn' : 'Computer is thinking...';
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500">
      <div className={`mb-4 text-sm font-bold h-6 flex items-center gap-2 ${themeStyles.textMuted}`}>
        {getStatusMessage()}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-6 relative">
        {/* Overlay to prevent clicks during computer turn */}
        {!isUserTurn && !isGameOver && (
          <div className="absolute inset-0 z-10 cursor-wait bg-transparent" />
        )}

        {squares.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!square || isGameOver}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl font-bold flex items-center justify-center transition-all transform active:scale-95 disabled:active:scale-100 overflow-hidden
              ${square 
                ? (square === 'X' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600') 
                : emptySquareClass
              }
            `}
            aria-label={`Square ${i}, ${square ? square : 'empty'}`}
            type="button"
          >
            {square === 'X' && (
              userAvatarUrl ? (
                <img 
                  src={userAvatarUrl} 
                  alt="User" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-8 h-8" />
              )
            )}
            {square === 'O' && <Bot className="w-8 h-8" />}
          </button>
        ))}
      </div>

      <button
        onClick={handleReset}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80 border ${themeStyles.border} ${themeStyles.text}`}
        type="button"
      >
        <RotateCcw className="w-4 h-4" /> Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;