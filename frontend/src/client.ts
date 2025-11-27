export class Client {
	private rest: string;
	private webrtc?: string;

	private peerConn?: RTCPeerConnection;

	constructor(rest_url: string, webrtc_url?: string) {
		this.rest = rest_url;
		this.webrtc = webrtc_url;
	}
	
	private lastTick: number = 0;

	onRtcGameMessage(event: MessageEvent) {
		const buffer = event.data as ArrayBuffer;

		const intView = new Int32Array(buffer);

		// Just an example protocol
		const tick = intView[0];
		if (tick < this.lastTick) return;
		this.lastTick = tick;
		const x = intView[1];
		const y = intView[2];

		console.log("Coordinates:", x, y);
	}

	onRtcChatMessage(event: MessageEvent) {
		const state = JSON.parse(event.data);
		console.log(state)
	}

	onRtcOpen() {
		console.log("Data Channel Open")
	}

	async rtcConnect() {
		console.log("Negotiating...");
		this.peerConn = new RTCPeerConnection({
			iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
		});
		const pc = this.peerConn;

		const dc = pc.createDataChannel("game", { ordered: false });
		dc.binaryType = "arraybuffer"; 
		dc.onopen = () => this.onRtcOpen();
		dc.onmessage = (event) => this.onRtcGameMessage(event);

		const dcChat = pc.createDataChannel("chat", { ordered: true });
		dcChat.onopen = () => this.onRtcOpen();
		dcChat.onmessage = (event) => this.onRtcChatMessage(event);

		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);

		await new Promise((resolve: CallableFunction) => {
		    if (pc.iceGatheringState === 'complete') resolve();
		    else pc.onicecandidate = (e) => { if (!e.candidate) resolve(); };
		});

		if (!pc.localDescription) {
			console.error("Couldn't connect to server through WebRTC");
			return;
		}

		// if null, use the same server frontend was served from
		const rtc_url = this.webrtc || '';
		const response = await fetch(`${rtc_url}/offer`, {
		    body: JSON.stringify({
			sdp: pc.localDescription.sdp,
			type: pc.localDescription.type,
		    }),
		    headers: { 'Content-Type': 'application/json' },
		    method: 'POST'
		});

		const answer = await response.json();
		await pc.setRemoteDescription(answer);
	}

	private async post<T>(path: string, body: any): Promise<T> {
		const res = await fetch(`${this.rest}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
		return res.json() as Promise<T>;
	}

	private async get<T>(path: string, body: any): Promise<T> {
		const res = await fetch(`${this.rest}${path}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
		return res.json() as Promise<T>;
	}
}
