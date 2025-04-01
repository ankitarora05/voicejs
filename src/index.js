// voice-recorder.js

(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
      // CommonJS / Node.js
      module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
      // AMD (Asynchronous Module Definition)
      define([], factory);
    } else {
      // Global (browser via CDN)
      global.VoiceRecorder = factory().VoiceRecorder;
      global.installVoiceRecorder = factory().installVoiceRecorder;
    }
  })(typeof window !== "undefined" ? window : this, function () {
    class VoiceRecorder {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new Error('Container not found');
            }
            this.init();
        }
    
        async init() {
            this.startButton = document.createElement('button');
            this.stopButton = document.createElement('button');
            this.downloadButton = document.createElement('a');
            this.transcriptionText = document.createElement('p');
    
            this.startButton.textContent = 'Start Recording';
            this.stopButton.textContent = 'Stop Recording';
            this.downloadButton.textContent = 'Download Audio';
            this.downloadButton.style.display = 'none';
    
            this.stopButton.disabled = true;
            this.transcriptionText.textContent = 'Speech will appear here...';
    
            this.container.appendChild(this.startButton);
            this.container.appendChild(this.stopButton);
            this.container.appendChild(this.downloadButton);
            this.container.appendChild(this.transcriptionText);
    
            this.mediaRecorder = null;
            this.audioChunks = [];
    
            this.startButton.addEventListener('click', () => this.startRecording());
            this.stopButton.addEventListener('click', () => this.stopRecording());
    
            // Initialize Speech Recognition
            this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
    
            this.speechRecognition.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript + ' ';
                }
                this.transcriptionText.textContent = transcript.trim();
            };
    
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
    
        async startRecording() {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
    
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
    
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
    
                this.downloadButton.href = audioUrl;
                this.downloadButton.download = 'recorded-audio.wav';
                this.downloadButton.style.display = 'block';
            };
    
            this.mediaRecorder.start();
            this.startButton.disabled = true;
            this.stopButton.disabled = false;
    
            // Start Speech Recognition
            this.speechRecognition.start();
        }
    
        stopRecording() {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            if (this.speechRecognition) {
                this.speechRecognition.stop();
            }
            this.startButton.disabled = false;
            this.stopButton.disabled = true;
        }
    }
    const installVoiceRecorder = (options) => new VoiceRecorder(options);
    return { VoiceRecorder, installVoiceRecorder };
});