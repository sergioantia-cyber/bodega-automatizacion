import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { soundService } from '../services/soundService';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
}

// Interfaz para SpeechRecognition de navegadores modernos
interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindowSpeech) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-PE';

      recognition.onstart = () => {
        setIsListening(true);
        soundService.playBeep();
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        if (transcript.trim()) {
          onTranscript(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListen = () => {
    if (!isSupported) {
      alert('Tu navegador o dispositivo no soporta dictado por voz.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch {
        // En caso ya esté corriendo
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      title={isListening ? 'Escuchando... Di lo que buscas' : 'Buscar por voz'}
      aria-label="Dictar búsqueda por voz"
      className={`relative w-10 h-10 rounded-xl border-2 border-slate-900 shadow-tactile-sm flex items-center justify-center transition-all duration-75 select-none touch-manipulation cursor-pointer shrink-0 ${
        isListening
          ? 'bg-bogad-coral text-white scale-105 shadow-none animate-pulse'
          : 'bg-bogad-yellow text-slate-950 hover:bg-yellow-300 active:translate-y-0.5'
      }`}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 stroke-[2.5]" />
      ) : (
        <Mic className="w-5 h-5 stroke-[2.5]" />
      )}

      {/* Onda expansiva animada al escuchar */}
      {isListening && (
        <span className="absolute -inset-1 rounded-xl bg-bogad-coral/40 animate-ping pointer-events-none" />
      )}
    </button>
  );
};
