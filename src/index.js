// voice-recorder.js
class VoiceRecorder {
	constructor(containerId) {
		this.container = document.getElementById(containerId);
		if (!this.container) {
			throw new Error("Container not found");
		}
		this.init();
	}

	async init() {
		this.startButton = document.createElement("button");
		this.stopButton = document.createElement("button");
		this.downloadButton = document.createElement("a");

		this.startButton.textContent = "Start Recording";
		this.stopButton.textContent = "Stop Recording";
		this.downloadButton.textContent = "Download Audio";
		this.downloadButton.style.display = "none";

		this.stopButton.disabled = true;

		this.container.appendChild(this.startButton);
		this.container.appendChild(this.stopButton);
		this.container.appendChild(this.downloadButton);

		this.mediaRecorder = null;
		this.audioChunks = [];

		this.startButton.addEventListener("click", () => this.startRecording());
		this.stopButton.addEventListener("click", () => this.stopRecording());
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
			const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
			const audioUrl = URL.createObjectURL(audioBlob);

			this.downloadButton.href = audioUrl;
			this.downloadButton.download = "recorded-audio.wav";
			this.downloadButton.style.display = "block";
		};

		this.mediaRecorder.start();
		this.startButton.disabled = true;
		this.stopButton.disabled = false;
	}

	stopRecording() {
		if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
			this.mediaRecorder.stop();
		}
		this.startButton.disabled = false;
		this.stopButton.disabled = true;
	}
}

export const installVoiceRecorder = (options) => new VoiceRecorder(options);

export default VoiceRecorder;
