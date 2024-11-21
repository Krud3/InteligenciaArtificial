import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStateManager } from '../logic/gameState';
import { Minimax } from '../logic/minimax';
import { Position, Difficulty } from '../types/game';
import { DIFFICULTIES } from '../constants/gameConstants';
import { evaluatePositionAI1 } from '../logic/ai/ai1';

export function useGame(difficulty: Difficulty) {
  const [gameState, setGameState] = useState<GameStateManager>(new GameStateManager());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const minimaxRef = useRef(new Minimax(evaluatePositionAI1, DIFFICULTIES[difficulty].depth));
  const isInitialMove = useRef(true);

  const checkGameOver = useCallback((state: GameStateManager) => {
    if (!state.hasPointsRemaining()) {
      console.log('Game Over - No points remaining');
      setIsGameOver(true);
    }
  }, []);

  const makeAIMove = useCallback(() => {
    console.log('makeAIMove called');
    
    setGameState(currentState => {
      if (currentState.currentPlayer !== 'black' || aiThinking) {
        console.log('makeAIMove cancelled', { 
          currentPlayer: currentState.currentPlayer, 
          aiThinking 
        });
        return currentState;
      }

      setAiThinking(true);
      
      try {
        const stateCopy = currentState.clone();
        const move = minimaxRef.current.getBestMove(stateCopy);
        
        if (move) {
          const success = stateCopy.makeMove(move.from, move.to);
          
          if (success) {
            console.log('AI move successful', move);
            if (!stateCopy.hasPointsRemaining()) {
              setIsGameOver(true);
            }
            return stateCopy;
          }
        }
        
        return currentState;
      } catch (error) {
        console.error('Error in AI move:', error);
        return currentState;
      } finally {
        setAiThinking(false);
      }
    });
  }, [aiThinking]);

  const handleSquareClick = useCallback((position: Position) => {
    if (aiThinking || isGameOver || gameState.currentPlayer !== 'white') {
      console.log('Click ignored - invalid state');
      return;
    }

    if (!selectedSquare) {
      if (
        position.row === gameState.whiteHorse.position.row && 
        position.col === gameState.whiteHorse.position.col
      ) {
        setSelectedSquare(position);
      }
    } else {
      const newGameState = gameState.clone();
      const moveSuccess = newGameState.makeMove(selectedSquare, position);
      
      if (moveSuccess) {
        setGameState(newGameState);
        setSelectedSquare(null);
        
        if (!newGameState.hasPointsRemaining()) {
          setIsGameOver(true);
        } else {
          // Programar el movimiento de la IA después de un breve delay
          setTimeout(makeAIMove, 500);
        }
      } else {
        setSelectedSquare(null);
      }
    }
  }, [gameState, selectedSquare, isGameOver, aiThinking, makeAIMove]);

  // Efecto para inicializar el juego
  useEffect(() => {
    const newGameState = new GameStateManager();
    setGameState(newGameState);
    setSelectedSquare(null);
    setIsGameOver(false);
    setAiThinking(false);
    isInitialMove.current = true;
    minimaxRef.current = new Minimax(evaluatePositionAI1, DIFFICULTIES[difficulty].depth);
  }, [difficulty]);

  // Efecto para el primer movimiento de la IA si le toca
  useEffect(() => {
    if (isInitialMove.current && gameState.currentPlayer === 'black' && !aiThinking) {
      isInitialMove.current = false;
      setTimeout(makeAIMove, 500);
    }
  }, [gameState, makeAIMove, aiThinking]);

  const resetGame = useCallback(() => {
    const newGameState = new GameStateManager();
    setGameState(newGameState);
    setSelectedSquare(null);
    setIsGameOver(false);
    setAiThinking(false);
    isInitialMove.current = true;
  }, []);

  return {
    gameState,
    isGameOver,
    selectedSquare,
    handleSquareClick,
    resetGame,
  };
}
