import { useState, useEffect, useCallback } from "react";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [capibaraY, setCapibaraY] = useState(100);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<{ x: number; id: number }[]>([]);
  const [secretCode, setSecretCode] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(3);

  const GROUND_HEIGHT = 100;
  const CAPIBARA_HEIGHT = 60;
  const JUMP_HEIGHT = 80;
  const OBSTACLE_WIDTH = 20;
  const OBSTACLE_HEIGHT = 40;

  // Прыжок копибары
  const jump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setCapibaraY((prev) => prev - JUMP_HEIGHT);
      setTimeout(() => {
        setCapibaraY((prev) => prev + JUMP_HEIGHT);
        setIsJumping(false);
      }, 500);
    }
  }, [isJumping, gameOver]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
          setGameOver(false);
          setScore(0);
          setObstacles([]);
          setSecretCode("");
          setShowSecretCode(false);
        } else {
          jump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, jump]);

  // Игровая логика
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Движение препятствий
      setObstacles((prev) => {
        const newObstacles = prev
          .map((obs) => ({ ...obs, x: obs.x - gameSpeed }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Добавляем новые препятствия
        if (
          newObstacles.length === 0 ||
          newObstacles[newObstacles.length - 1].x < 600
        ) {
          newObstacles.push({
            x: 800,
            id: Date.now(),
          });
        }

        return newObstacles;
      });

      // Увеличиваем счет медленнее
      setScore((prev) => prev + 0.1);

      // Увеличиваем скорость игры
      setGameSpeed((prev) => Math.min(prev + 0.005, 8));
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gameSpeed]);

  // Проверка столкновений
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const capibaraX = 100;
    const capibaraBottom = 400 - capibaraY - CAPIBARA_HEIGHT;

    obstacles.forEach((obstacle) => {
      if (
        obstacle.x < capibaraX + 50 &&
        obstacle.x + OBSTACLE_WIDTH > capibaraX &&
        capibaraBottom < OBSTACLE_HEIGHT
      ) {
        setGameOver(true);
      }
    });
  }, [obstacles, capibaraY, gameStarted, gameOver]);

  // Секретный код при достижении 100 очков
  useEffect(() => {
    if (Math.floor(score) >= 100 && !secretCode) {
      // Имитация "бекенда" - здесь код спрятан
      const hiddenCode = "SPacEKopUbarich";
      setSecretCode(hiddenCode);
      setShowSecretCode(true);
    }
  }, [score, secretCode]);

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setCapibaraY(100);
    setIsJumping(false);
    setObstacles([]);
    setSecretCode("");
    setShowSecretCode(false);
    setGameSpeed(3);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-mono">
      {/* Секретный код */}
      {showSecretCode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="text-center">
            <div className="text-sm font-bold">
              🎉 Секретный код разблокирован!
            </div>
            <div className="text-lg font-mono">{secretCode}</div>
          </div>
        </div>
      )}

      {/* Игровое поле */}
      <div className="relative w-full max-w-4xl h-96 bg-white border-2 border-gray-300 overflow-hidden">
        {/* Счет */}
        <div className="absolute top-4 right-4 text-xl font-bold text-gray-700">
          {Math.floor(score).toString().padStart(5, "0")}
        </div>

        {/* Копибара */}
        <div
          className={`absolute transition-all duration-300 ${isJumping ? "animate-bounce" : ""}`}
          style={{
            left: "100px",
            bottom: `${capibaraY}px`,
            width: "50px",
            height: "60px",
          }}
        >
          <img
            src="https://cdn.poehali.dev/files/bd8d70f8-0c64-42f6-9ce7-05423e8dcbc4.png"
            alt="Копибара"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Препятствия */}
        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className="absolute bg-gray-600"
            style={{
              left: `${obstacle.x}px`,
              bottom: `${GROUND_HEIGHT}px`,
              width: `${OBSTACLE_WIDTH}px`,
              height: `${OBSTACLE_HEIGHT}px`,
            }}
          />
        ))}

        {/* Земля */}
        <div
          className="absolute bottom-0 w-full bg-gray-300"
          style={{ height: `${GROUND_HEIGHT}px` }}
        />

        {/* Стартовый экран */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Копибара Раннер
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Нажми ПРОБЕЛ для старта
              </p>
              <div className="text-sm text-gray-500">
                Используй ПРОБЕЛ для прыжка
              </div>
            </div>
          </div>
        )}

        {/* Экран окончания игры */}
        {gameOver && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Игра окончена!
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Счет: {Math.floor(score)}
              </p>
              {secretCode && (
                <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
                  <div className="text-lg font-bold text-yellow-800">
                    Секретный код: {secretCode}
                  </div>
                </div>
              )}
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Играть снова
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Инструкции */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        <p>ПРОБЕЛ - прыжок | Достигни 100 очков для секретного кода!</p>
      </div>
    </div>
  );
};

export default Index;
