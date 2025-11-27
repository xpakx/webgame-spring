export class Client {
	private rest: string;
	private webrtc?: string;

	private peerConn?: RTCPeerConnection;

	constructor(rest_url: string, webrtc_url?: string) {
		this.rest = rest_url;
		this.webrtc = webrtc_url;
	}

	onRtcGameMessage(event: MessageEvent) {
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

		dc.onopen = () => this.onRtcOpen();
		dc.onmessage = (event) => this.onRtcGameMessage(event);

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
}
