import { useState, useEffect, useCallback } from "react";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [capibaraY, setCapibaraY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<
    { x: number; type: "cactus" | "bird"; height: number; id: number }[]
  >([]);
  const [secretCode, setSecretCode] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(6);
  const [groundOffset, setGroundOffset] = useState(0);

  const GROUND_HEIGHT = 150;
  const CAPIBARA_SIZE = 44;
  const CACTUS_WIDTH = 20;
  const CACTUS_HEIGHT = 46;
  const BIRD_WIDTH = 46;
  const BIRD_HEIGHT = 26;

  // Прыжок копибары
  const jump = useCallback(() => {
    if (!isJumping && !gameOver && capibaraY === 0) {
      setIsJumping(true);
      let jumpHeight = 0;
      let jumpVelocity = 12;

      const jumpInterval = setInterval(() => {
        jumpHeight += jumpVelocity;
        jumpVelocity -= 0.8;

        if (jumpHeight <= 0) {
          jumpHeight = 0;
          setIsJumping(false);
          clearInterval(jumpInterval);
        }

        setCapibaraY(jumpHeight);
      }, 16);
    }
  }, [isJumping, gameOver, capibaraY]);

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
          setGameSpeed(6);
        } else if (gameOver) {
          // Перезапуск игры
          setGameStarted(false);
          setGameOver(false);
          setScore(0);
          setCapibaraY(0);
          setObstacles([]);
          setSecretCode("");
          setShowSecretCode(false);
          setGameSpeed(6);
        } else {
          jump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver, jump]);

  // Создание препятствий
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const obstacleInterval = setInterval(
      () => {
        const obstacleType = Math.random() > 0.7 ? "bird" : "cactus";
        const newObstacle = {
          x: 800,
          type: obstacleType,
          height: obstacleType === "bird" ? 50 : 0,
          id: Date.now(),
        };
        setObstacles((prev) => [...prev, newObstacle]);
      },
      1500 + Math.random() * 1000,
    );

    return () => clearInterval(obstacleInterval);
  }, [gameStarted, gameOver]);

  // Движение препятствий и подсчет очков
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveObstacles = setInterval(() => {
      setObstacles((prev) => {
        const newObstacles = prev
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - gameSpeed,
          }))
          .filter((obstacle) => obstacle.x > -50);

        // Увеличиваем счет за каждое пройденное препятствие
        const passedObstacles =
          prev.filter((obstacle) => obstacle.x > 80).length -
          newObstacles.filter((obstacle) => obstacle.x > 80).length;

        if (passedObstacles > 0) {
          setScore((currentScore) => currentScore + passedObstacles);
        }

        return newObstacles;
      });
    }, 16);

    return () => clearInterval(moveObstacles);
  }, [gameStarted, gameOver, gameSpeed]);

  // Движение земли
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const groundInterval = setInterval(() => {
      setGroundOffset((prev) => (prev + gameSpeed) % 20);
    }, 16);

    return () => clearInterval(groundInterval);
  }, [gameStarted, gameOver, gameSpeed]);

  // Увеличение скорости игры
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const speedInterval = setInterval(() => {
      setGameSpeed((prevSpeed) => Math.min(prevSpeed + 0.2, 12));
    }, 10000);

    return () => clearInterval(speedInterval);
  }, [gameStarted, gameOver]);

  // Проверка столкновений
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const checkCollision = () => {
      const capibaraRect = {
        x: 80,
        y: capibaraY,
        width: CAPIBARA_SIZE,
        height: CAPIBARA_SIZE,
      };

      obstacles.forEach((obstacle) => {
        let obstacleRect;

        if (obstacle.type === "cactus") {
          obstacleRect = {
            x: obstacle.x,
            y: 0,
            width: CACTUS_WIDTH,
            height: CACTUS_HEIGHT,
          };
        } else {
          // bird
          obstacleRect = {
            x: obstacle.x,
            y: obstacle.height,
            width: BIRD_WIDTH,
            height: BIRD_HEIGHT,
          };
        }

        if (
          capibaraRect.x < obstacleRect.x + obstacleRect.width &&
          capibaraRect.x + capibaraRect.width > obstacleRect.x &&
          capibaraRect.y < obstacleRect.y + obstacleRect.height &&
          capibaraRect.y + capibaraRect.height > obstacleRect.y
        ) {
          setGameOver(true);
        }
      });
    };

    const collisionInterval = setInterval(checkCollision, 16);
    return () => clearInterval(collisionInterval);
  }, [gameStarted, gameOver, obstacles, capibaraY]);

  // Секретный код при достижении 100 очков
  useEffect(() => {
    if (score >= 100 && !secretCode) {
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
    setCapibaraY(0);
    setIsJumping(false);
    setObstacles([]);
    setSecretCode("");
    setShowSecretCode(false);
    setGameSpeed(6);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-mono">
      <div className="w-full max-w-5xl">
        {/* Секретный код */}
        {showSecretCode && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="text-center">
              <div className="text-sm font-bold">
                🎉 Секретный код: {secretCode}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-100 rounded-lg shadow-lg p-4 relative overflow-hidden">
          {/* Счет */}
          <div className="absolute top-4 right-4 z-10">
            <div className="text-gray-600 font-mono text-lg">
              {score.toString().padStart(5, "0")}
            </div>
          </div>

          {/* Игровое поле */}
          <div className="relative h-64 bg-white overflow-hidden">
            {/* Облака */}
            <div
              className="absolute top-6 opacity-60"
              style={{ left: `${400 - groundOffset * 2}px` }}
            >
              <div className="w-8 h-4 bg-gray-300 rounded-full"></div>
              <div className="w-6 h-3 bg-gray-300 rounded-full ml-2 -mt-2"></div>
              <div className="w-4 h-2 bg-gray-300 rounded-full ml-4 -mt-1"></div>
            </div>

            <div
              className="absolute top-12 opacity-60"
              style={{ left: `${600 - groundOffset * 2}px` }}
            >
              <div className="w-6 h-3 bg-gray-300 rounded-full"></div>
              <div className="w-4 h-2 bg-gray-300 rounded-full ml-1 -mt-1"></div>
            </div>

            {/* Копибара */}
            <div
              className="absolute transition-none"
              style={{
                bottom: `${capibaraY + 40}px`,
                left: "80px",
              }}
            >
              <img
                src="https://cdn.poehali.dev/files/bd8d70f8-0c64-42f6-9ce7-05423e8dcbc4.png"
                alt="Копибара"
                className="w-11 h-11 object-cover"
              />
            </div>

            {/* Препятствия */}
            {obstacles.map((obstacle) => (
              <div
                key={obstacle.id}
                className="absolute"
                style={{
                  left: `${obstacle.x}px`,
                  bottom:
                    obstacle.type === "cactus"
                      ? "40px"
                      : `${obstacle.height + 40}px`,
                }}
              >
                {obstacle.type === "cactus" ? (
                  <div className="w-5 h-12 bg-green-600 relative">
                    <div className="absolute top-3 -left-2 w-6 h-2 bg-green-600 rounded-full"></div>
                    <div className="absolute top-6 -right-2 w-4 h-2 bg-green-600 rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-12 h-7 bg-gray-600 relative">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                    <div className="absolute bottom-1 left-2 w-8 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}

            {/* Земля */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-300 border-t-2 border-gray-400">
              <div
                className="absolute inset-0 bg-repeat-x"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, #9CA3AF 10px, #9CA3AF 12px)`,
                  backgroundPosition: `-${groundOffset}px 0`,
                }}
              ></div>
            </div>

            {/* Экран начала игры */}
            {!gameStarted && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center text-gray-800">
                  <div className="text-6xl mb-4">🦦</div>
                  <h2 className="text-2xl font-bold mb-4 font-mono">
                    КОПИБАРА РАННЕР
                  </h2>
                  <p className="mb-4 font-mono">Нажмите ПРОБЕЛ для прыжка</p>
                  <button
                    onClick={() => setGameStarted(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-mono"
                  >
                    НАЧАТЬ ИГРУ
                  </button>
                </div>
              </div>
            )}

            {/* Экран игры окончен */}
            {gameOver && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center text-gray-800">
                  <div className="text-4xl mb-4">💀</div>
                  <h2 className="text-2xl font-bold mb-2 font-mono">
                    ИГРА ОКОНЧЕНА
                  </h2>
                  <p className="text-lg mb-4 font-mono">Счет: {score}</p>
                  {showSecretCode && (
                    <p className="text-sm mb-4 font-mono text-green-600 font-bold">
                      🎉 Секретный код: {secretCode}
                    </p>
                  )}
                  <button
                    onClick={resetGame}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-mono"
                  >
                    ИГРАТЬ СНОВА
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Инструкции */}
          <div className="mt-4 text-center text-gray-600 font-mono text-sm">
            <p>
              Нажмите ПРОБЕЛ или ↑ для прыжка | Достигните 100 очков для
              секретного кода!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
