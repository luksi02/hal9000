import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    setUtterance(u);

    // Add an event listener to the speechSynthesis object to listen for the voiceschanged event
    synth.addEventListener("voiceschanged", () => {
      const voices = synth.getVoices();
      setVoice(voices[0]);
    });

    return () => {
      synth.cancel();
      synth.removeEventListener("voiceschanged", () => {
        setVoice(null);
      });
    };
  }, [text]);

  const voices = window.speechSynthesis.getVoices();
  const desiredVoiceName = "Microsoft Zira Desktop - English (United States)"; // Replace with your desired voice name
  const desiredVoice = voices.find(voice => voice.name === desiredVoiceName);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    } else {
      // utterance.voice = voice;
      utterance.voice = desiredVoice;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;
      synth.speak(utterance);
    }

    setIsPaused(false);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    setIsPaused(true);
    synth.pause();
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    setIsPaused(false);
    synth.cancel();
  };

  const handleVoiceChange = (event) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find((v) => v.name === event.target.value));
  };

  const handlePitchChange = (event) => {
    setPitch(parseFloat(event.target.value));
  };

  const handleRateChange = (event) => {
    setRate(parseFloat(event.target.value));
  };

  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value));
  };


  // <div className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-5 py-3">
  return (
    <div >

      {/* <label>
        Voice:
        <select value={voice?.name} onChange={handleVoiceChange}>
          {window.speechSynthesis.getVoices().map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </label> */}

      <br />

      {/* <label>
        Pitch:
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={handlePitchChange}
        />
      </label>

      <br />

      <label>
        Speed:
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
        />
      </label>
      <br />
      <label>
        Volume:
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      </label> */}

      {/* <br /> */}

      <div className="button-container w-full flex">
        <button onClick={handlePlay} className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-5 py-3">
          {isPaused ? "Resume" : "Play"}
        </button>
        <button onClick={handlePause} className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-5 py-3">
          Pause
        </button>
        <button onClick={handleStop} className="w-full flex border-yellow-500 border-2 bg-black hover:bg-purple-800 font-semibold text-yellow-500 text-center rounded-md px-5 py-3">
          Stop
        </button>
      </div>

    </div>
  );
};

export default TextToSpeech;
