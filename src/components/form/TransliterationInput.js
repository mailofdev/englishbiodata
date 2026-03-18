import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TransliterationInput = ({ value, onChange, placeholder, restrictNumbers, inputType, className }) => {
  const [text, setText] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { setText(value); }, [value]);

  const handleChange = async (event) => {
    const inputText = event.target.value;
    const cursorPos = event.target.selectionStart;
    setText(inputText);
    setCursorPosition(cursorPos);
    onChange(inputText);
    if (inputType === 'text') {
      const beforeCursor = inputText.slice(0, cursorPos);
      const wordsBeforeCursor = beforeCursor.split(' ');
      const currentWord = wordsBeforeCursor.pop();
      if (currentWord) {
        try {
          const response = await axios.get(`https://pratikmal01.pythonanywhere.com/transliterate?text=${currentWord}&lang_code=mr`);
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        } catch (error) { /* suggestions fetch failed */ }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const beforeCursor = text.slice(0, cursorPosition);
    const afterCursor = text.slice(cursorPosition);
    const wordsBeforeCursor = beforeCursor.split(' ');
    wordsBeforeCursor.pop();
    const newText = `${wordsBeforeCursor.join(' ')}${wordsBeforeCursor.length > 0 ? ' ' : ''}${suggestion}${afterCursor}`;
    const newCursorPosition = `${wordsBeforeCursor.join(' ')}${wordsBeforeCursor.length > 0 ? ' ' : ''}${suggestion}`.length;
    setText(newText);
    setCursorPosition(newCursorPosition);
    onChange(newText);
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => { inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition); }, 0);
  };

  const handleKeyDown = (event) => {
    if (showSuggestions) {
      if (event.key === 'ArrowDown') setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      else if (event.key === 'ArrowUp') setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
        event.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
        setActiveSuggestionIndex(-1);
      }
    }
  };

  const handleBlur = () => { setTimeout(() => setShowSuggestions(false), 100); };

  return (
    <div className="position-relative w-100">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={className || 'form-control'}
        placeholder={placeholder}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="list-unstyled position-absolute w-100 m-0 p-0 border rounded shadow-sm bg-white" style={{ zIndex: 1050 }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-3 py-2 cursor-pointer"
              style={{ backgroundColor: index === activeSuggestionIndex ? 'var(--maza-border, #E2E8F0)' : 'white', cursor: 'pointer' }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransliterationInput;
