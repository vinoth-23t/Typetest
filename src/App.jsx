import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [paragraph, setParagraph] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Fetch paragraph when app loads
  useEffect(() => {
    fetchParagraph();
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;

    if (isTyping && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsTyping(false);
    }

    return () => clearInterval(timer);
  }, [isTyping, timeLeft]);

  // Fetch random paragraph from API
  const fetchParagraph = async () => {
    try {
      const response = await fetch(
        "https://baconipsum.com/api/?type=meat-and-filler&paras=1&format=text"
      );

      const data = await response.text();
      setParagraph(data);
    } catch (error) {
      console.error("Error fetching paragraph:", error);
      setParagraph(
        "React is a JavaScript library for building user interfaces and creating reusable UI components."
      );
    }
  };

  // Calculate WPM and Accuracy
  const calculateStats = (value) => {
    const wordsTyped = value.trim().split(/\s+/).filter(Boolean).length;

    const elapsedTime = (60 - timeLeft) / 60;
    const currentWpm =
      elapsedTime > 0 ? Math.round(wordsTyped / elapsedTime) : 0;

    setWpm(currentWpm);

    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === paragraph[i]) {
        correctChars++;
      }
    }

    const acc =
      value.length > 0
        ? Math.round((correctChars / value.length) * 100)
        : 100;

    setAccuracy(acc);
  };

  // Handle typing
  const handleChange = (e) => {
    if (timeLeft === 0) return;

    if (!isTyping) {
      setIsTyping(true);
    }

    const value = e.target.value;
    setInput(value);
    calculateStats(value);
  };

  // Restart the test
  const restartTest = () => {
    setInput("");
    setTimeLeft(60);
    setIsTyping(false);
    setWpm(0);
    setAccuracy(100);
    fetchParagraph();
  };

  // Progress calculation
  const progress = paragraph
    ? Math.min(
        Math.round((input.length / paragraph.length) * 100),
        100
      )
    : 0;

  return (
    <div className="container">
      <h1>⌨️ Typing Speed Test</h1>

      {/* Stats */}
      <div className="stats">
        <div>
          <h3>⏳ Time</h3>
          <p>{timeLeft}s</p>
        </div>

        <div>
          <h3>🚀 WPM</h3>
          <p>{wpm}</p>
        </div>

        <div>
          <h3>🎯 Accuracy</h3>
          <p>{accuracy}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="progress-text">Progress: {progress}%</p>

      {/* Paragraph with character highlighting */}
      <div className="paragraph-box">
        {paragraph ? (
          paragraph.split("").map((char, index) => {
            let className = "";

            if (index < input.length) {
              className =
                input[index] === char ? "correct" : "incorrect";
            } else if (index === input.length) {
              className = "current";
            }

            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })
        ) : (
          <p>Loading paragraph...</p>
        )}
      </div>

      {/* Typing Area */}
      <textarea
        placeholder="Start typing here..."
        value={input}
        onChange={handleChange}
        disabled={timeLeft === 0}
      />

      {/* Buttons */}
      <div className="button-group">
        <button onClick={restartTest}>🔄 Restart Test</button>
      </div>

      {/* Result */}
      {timeLeft === 0 && (
        <div className="result">
          <h2>🎉 Test Completed!</h2>
          <h3>🚀 {wpm} WPM</h3>
          <h3>🎯 {accuracy}% Accuracy</h3>
          <p>Click Restart to try again with a new paragraph.</p>
        </div>
      )}
    </div>
  );
}

export default App;