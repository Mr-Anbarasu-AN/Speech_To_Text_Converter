import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const [showReplayButton, setShowReplayButton] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);

  const { finalTranscript, resetTranscript } = useSpeechRecognition();

  const synth = useRef(window.speechSynthesis);
  const utterance = useRef(null);

  const startTextToSpeech = useCallback(() => {
    if (!synth.current || isSpeaking || !transcript) return;

    setIsSpeaking(true);
    setIsPaused(false);

    const newUtterance = new SpeechSynthesisUtterance(transcript);
    utterance.current = newUtterance;
    synth.current.speak(newUtterance);

    setShowStopButton(true);
    setShowReplayButton(true);
  }, [isSpeaking, transcript]);

  const stopTextToSpeech = useCallback(() => {
    if (!synth.current) return;

    synth.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setShowStopButton(false);
    setShowReplayButton(false);
  }, []);

  const pauseTextToSpeech = useCallback(() => {
    if (!synth.current) return;

    synth.current.pause();
    setIsSpeaking(false);
    setIsPaused(true);
  }, []);

  const resumeTextToSpeech = useCallback(() => {
    if (!synth.current) return;

    synth.current.resume();
    setIsSpeaking(true);
    setIsPaused(false);
  }, []);

  const replayTextToSpeech = useCallback(() => {
    if (!synth.current || !utterance.current) return;

    setIsSpeaking(true);
    setIsPaused(false);
    synth.current.cancel();
    synth.current.speak(utterance.current);
  }, []);

  const resetSpeechRecognition = useCallback(() => {
    resetTranscript();
    setTranscript('');
    setIsSpeaking(false);
    setIsPaused(false);
    setShowStopButton(false);
    setShowReplayButton(false);
  }, [resetTranscript]);

  useEffect(() => {
    if (isSpeechRecognitionActive) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [isSpeechRecognitionActive]);

  useEffect(() => {
    if (finalTranscript !== '') {
      setTranscript(finalTranscript);
    }
  }, [finalTranscript]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      synth.current.cancel();
    };
  }, []);

  const toggleSpeechRecognition = useCallback(() => {
    setIsSpeechRecognitionActive((prev) => {
      if (!prev) {
        resetTranscript();
      }
      return !prev;
    });
  }, [resetTranscript]);

  return (
    <div className="container">
      <h1>Speech-to-Text and Text-to-Speech Converter</h1>
      <button
        className={isSpeechRecognitionActive ? 'active' : ''}
        onClick={toggleSpeechRecognition}
      >
        {isSpeechRecognitionActive ? 'Stop Speech Recognition' : 'Start Speech Recognition'}
      </button>
      <button onClick={resetSpeechRecognition}>Reset Speech Recognition</button>
      <div className="transcript-container">
        <label htmlFor="transcript">Transcript:</label>
        <textarea
          id="transcript"
          className="transcript"
          placeholder="Type anything here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          readOnly={isSpeechRecognitionActive}
        />
      </div>

      {!showStopButton && !showReplayButton && (
        <button
          className={`primary ${isSpeaking ? 'active' : ''}`}
          onClick={startTextToSpeech}
          disabled={!transcript || isSpeaking}
        >
          Start Text to Speech
        </button>
      )}

      {showStopButton && (
        <div className="button-group">
          <button className={`primary ${isSpeaking && !isPaused ? 'active' : ''}`} onClick={stopTextToSpeech}>
            Stop
          </button>
          <button className={`secondary ${isPaused ? 'active' : ''}`} onClick={pauseTextToSpeech}>
            Pause
          </button>
          <button className={`secondary ${!isPaused ? 'active' : ''}`} onClick={resumeTextToSpeech}>
            Resume
          </button>
          <button
            className={`secondary ${isSpeaking && showReplayButton && !isPaused ? 'active' : ''}`}
            onClick={replayTextToSpeech}
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;