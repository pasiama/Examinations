import React, { useState, useEffect, useRef } from "react";
import "./SpeechToText.css";
const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptLog, setTranscriptLog] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mapping spoken punctuation to actual punctuation symbols
  const punctuationMap = {
    comma: ",",
    period: ".",
    "full stop": ".",
    "exclamation mark": "!",
    "exclamation point": "!",
    "question mark": "?",
    colon: ":",
    semicolon: ";",
    dash: "-",
    hyphen: "-",
    "open parentheses": "(",
    "close parentheses": ")",
    "open bracket": "[",
    "close bracket": "]",
    "open brace": "{",
    "close brace": "}",
    quote: '"',
    "double quote": '"',
    "single quote": "'",
    apostrophe: "'",
    slash: "/",
    backslash: "\\",
    hyphen: "-",
    underscore: "_",
  };
  const mathSymbolsMap = {
    plus: "+",
    minus: "-",
    times: "×",
    "multiplied by": "×",
    "divided by": "÷",
    equals: "=",
    "greater than": ">",
    "less than": "<",
    "square root of": "√",
    pi: "π",
    theta: "θ",
    alpha: "α",
    beta: "β",
    percent: "%",
    // Add any other symbols you need
  };

  const replaceSymbols = (text) => {
    // Replace punctuation first
    let processedText = text.replace(
      /\b(?:period|comma|question mark|exclamation mark|colon|semicolon|open parenthesis|close parenthesis|open bracket|close bracket|open brace|close brace|slash|backslash|quote|apostrophe|hyphen|underscore)\b/g,
      (match) => {
        return punctuationMap[match.toLowerCase()] || match;
      }
    );

    // Replace math symbols
    processedText = processedText.replace(
      /\b(?:plus|minus|times|multiplied by|divided by|equals|greater than|less than|square root of|pi|theta|alpha|beta|percent)\b/g,
      (match) => {
        return mathSymbolsMap[match.toLowerCase()] || match;
      }
    );

    return processedText;
  };

  const replaceMathSymbols = (text) => {
    return text.replace(
      /\b(?:plus|minus|times|multiplied by|divided by|equals|greater than|less than|square root of|pi|theta|alpha|beta|percent)\b/g,
      (match) => {
        return mathSymbolsMap[match.toLowerCase()] || match;
      }
    );
  };
  const replacePunctuationWords = (text) => {
    // Replace each spoken punctuation word with its corresponding symbol
    Object.keys(punctuationMap).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi"); // Regex to match whole words only
      text = text.replace(regex, punctuationMap[word]);
    });
    return text;
  };
  // Capture mouse position on click
  const handleMouseClick = (event) => {
    const x = event.clientX;
    const y = event.clientY;
    setMousePosition({ x, y });
  };
  // Load transcriptions from local storage on component mount
  useEffect(() => {
    const savedLog = JSON.parse(localStorage.getItem("transcriptLog")) || [];
    if (transcriptLog.length === 0) {
      // Load only if not already in state
      setTranscriptLog(savedLog);
    }
  }, []);

  const updateLocalStorage = (newEntries, editingIndex = null) => {
    // Retrieve existing transcripts from local storage, if any
    const existingLog = JSON.parse(localStorage.getItem("transcriptLog")) || [];

    let updatedLog;

    if (editingIndex !== null) {
      // In edit mode, update only the specific transcription entry
      updatedLog = [...existingLog];
      updatedLog[editingIndex] = {
        ...updatedLog[editingIndex],
        content: newEntries,
      }; // Update content of the edited entry
    } else {
      // In non-edit mode, append new transcriptions to existing log
      updatedLog = [...existingLog, ...newEntries];
    }

    // Save the updated log back to local storage
    localStorage.setItem("transcriptLog", JSON.stringify(updatedLog));

    // Update state with the latest log
    setTranscriptLog(updatedLog);
  };
  // Initialize canvas settings when modal is opened
  useEffect(() => {
    if (isModalOpen) initializeCanvas();
  }, [isModalOpen]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = false;

      newRecognition.onresult = (event) => {
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript.trim() + " ";
          }
        }
        handleCommands(finalText);
      };

      newRecognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      newRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(newRecognition);
    } else {
      console.warn("Speech Recognition API not supported on this browser");
    }
  }, []);

  const handleCommands = (text) => {
    let processedText = replaceSymbols(text.trim());

    // Continue with your existing command handling, like capitalizing the first letter
    processedText = capitalizeFirstLetter(processedText);
    let newYPosition =
      transcriptLog.length > 0
        ? transcriptLog[transcriptLog.length - 1].position.y + 30
        : 0; // 30px as an example line height

    const updatedTranscript = [...transcriptLog];

    if (processedText.startsWith("Heading")) {
      updatedTranscript.push({
        type: "heading",
        content: processedText.replace("Heading", "").trim(),
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
    } else if (processedText.startsWith("Subheading")) {
      updatedTranscript.push({
        type: "subheading",
        content: capitalizeWords(
          processedText.replace("Subheading", "").trim()
        ),
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
    } else if (processedText.startsWith("Questions")) {
      updatedTranscript.push({
        type: "question",
        content: `${questionNumber}. ${capitalizeFirstLetterAfterPeriod(
          processedText.replace("Questions", "").trim()
        )}`,
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
      setQuestionNumber(questionNumber + 1);
    } else if (processedText.startsWith("Next question")) {
      updatedTranscript.push({
        type: "nextquestion",
        content: `${questionNumber}. ${capitalizeFirstLetterAfterPeriod(
          processedText.replace("Next question", "").trim()
        )}`,
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
      setQuestionNumber(questionNumber + 1);
    } else if (processedText.startsWith("Options")) {
      const options = processedText.replace("Options", "").trim().split(",");
      updatedTranscript.push({
        type: "options",
        content: options.map((option) => option.trim()),
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
    } else if (processedText.startsWith("Title")) {
      updatedTranscript.push({
        type: "title",
        content: capitalizeWords(processedText.replace("Title", "").trim()),
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
    } else {
      updatedTranscript.push({
        type: "text",
        content: processedText,
        position: { x: mousePosition?.x ?? 0, y: newYPosition },
      });
    }

    setTranscriptLog(updatedTranscript);
    updateLocalStorage(updatedTranscript); // Persist the updated transcript log when adding new entries
  };

  const handleKeyDown = (event) => {
    // Check if the 'Enter' key was pressed
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action (inserting a new div or <p>)

      // Get the current selection and the range (cursor position)
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Create a new line (line break)
      const lineBreak = document.createElement("br");
      range.deleteContents(); // Remove the current selection
      range.insertNode(lineBreak); // Insert the line break at the cursor position

      // Move the cursor to the next line
      range.setStartAfter(lineBreak);
      range.setEndAfter(lineBreak);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const clearTranscript = () => {
    setTranscriptLog([]);
    setQuestionNumber(1);
    localStorage.removeItem("transcriptLog");
  };

  const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const capitalizeWords = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const capitalizeFirstLetterAfterPeriod = (text) => {
    // Capitalize the first letter after a period
    return text.replace(
      /(\. )([a-z])/g,
      (match, p1, p2) => p1 + p2.toUpperCase()
    );
  };

  const handleContentEdit = (index, e) => {
    const editedText = e.target.innerText.trim();
    setTranscriptLog((prevLog) => {
      const updatedLog = [...prevLog];
      updatedLog[index].content = editedText; // Update the specific entry's content
      return updatedLog;
    });

    // Persist the updated content to local storage
    updateLocalStorage(editedText, index); // Pass the edited text and index to the updated function
  };

  // Inside your component:
  useEffect(() => {
    initializeCanvas();
  }, []);

  // Function to apply text formatting
  const applyFormat = (command) => {
    document.execCommand(command, false, null);
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  };

  useEffect(() => {
    initializeCanvas();
  }, []);

  const getMousePosition = (event) => ({
    x: event.nativeEvent.offsetX,
    y: event.nativeEvent.offsetY,
  });

  const getTouchPosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const { x, y } = event.type.includes("touch")
      ? getTouchPosition(event)
      : getMousePosition(event);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { x, y } = event.type.includes("touch")
      ? getTouchPosition(event)
      : getMousePosition(event);
    const context = contextRef.current;
    if (context) {
      context.lineTo(x, y);
      context.stroke();
      context.lineCap = "round";
      context.strokeStyle = "black";
      context.lineWidth = 2;
    }
  };

  return (
    <div>
      <h1>Ella's Examination Center</h1>
      <button onClick={toggleListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <button onClick={clearTranscript}>Clear Text</button>
      <button
        onClick={() =>
          contextRef.current.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          )
        }
      >
        Clear Drawing
      </button>
      <button onClick={toggleModal}>Draw Shape</button>

      {/* Display the full transcript log */}
      <div
        onClick={handleMouseClick}
        className="text-editor container"
        contentEditable={true}
        suppressContentEditableWarning={true}
        style={{
          padding: "10px",
          minHeight: "300px",
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          position: "relative",
          height: "100vh",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Toolbar for text formatting */}
        {/* <div className="toolbar">
          <button onClick={() => applyFormat("bold")}>Bold</button>
          <button onClick={() => applyFormat("italic")}>Italic</button>
          <button onClick={() => applyFormat("underline")}>Underline</button>
          <button onClick={() => applyFormat("strikeThrough")}>Strike</button>
          <button onClick={() => applyFormat("justifyLeft")}>Align Left</button>
          <button onClick={() => applyFormat("justifyCenter")}>
            Align Center
          </button>
          <button onClick={() => applyFormat("justifyRight")}>
            Align Right
          </button>
        </div> */}

        {transcriptLog.map((entry, index) => {
          const entryStyle = {
            fontFamily: "Times New Roman",
            fontWeight:
              entry.type === "heading" || entry === "subheading"
                ? "bold"
                : "normal",
            fontSize:
              entry.type === "heading"
                ? "28px"
                : entry.type === "subheading"
                ? "24px"
                : entry.type === "title"
                ? "20px"
                : "16px",
            textTransform: entry.type === "heading" ? "uppercase" : "none",
            lineHeight: entry.type === "heading" ? "1.5" : "1.2",
            color:
              entry.type === "heading" || entry.type === "subheading"
                ? "black"
                : entry.type === "title"
                ? "black"
                : "black",
            fontStyle: entry.type === "title" ? "underline" : "normal",
          };
          // Special alignment for questions and options
          const alignmentStyle =
            entry.type === "question" ||
            entry.type === "nextquestion" ||
            entry.type === "text" ||
            entry.type === "options"
              ? {
                  textAlign: "left", // Align text to the left
                  paddingLeft: "20px", // Add padding from the left edge
                  justifyContent: "space-between", // or "space-evenly" for equal spacing
                  alignItems: "center",
                  marginTop: "3px"
                }
              : {};
          //  const cursorStyles = {
          //   position: "absolute",
          //   left: entry.position?.x ?? 0, // Fallback to 0 if position.x is undefined
          //   top: entry.position?.y ?? 0,   // Fallback to 0 if position.y is undefined
          //   backgroundColor: "lightyellow",
          //   padding: "5px",
          //   borderRadius: "3px",
          //  }
          // Merge entryStyle and alignmentStyle
          const combinedStyle = { ...entryStyle, ...alignmentStyle };
          console.log("transcriptLog:", transcriptLog);

          return (
            <div key={index}>
              <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                style={combinedStyle}
                onBlur={(e) => handleContentEdit(index, e)} // Save on blur (when the user clicks away)
              >
                {entry.content}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal for drawing */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={toggleModal} className="close-btn">
              Close
            </button>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={finishDrawing}
              onTouchMove={draw}
              style={{
                border: "1px solid #000",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>
      )}
      {/* Separate Canvas Element for Drawing */}
    </div>
  );
};

export default SpeechToText;
