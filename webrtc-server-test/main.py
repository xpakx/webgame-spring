import math
import asyncio
import os
import struct

from aiohttp import web
from aiortc import (
        RTCPeerConnection, RTCSessionDescription,
        RTCIceServer, RTCConfiguration
)


# loop is for single client for now
async def run_game_loop(channel):
    print(f"Starting game loop for channel {channel.label}...")
    while channel.readyState != "open":
        print(f"Waiting for channel... current state: {channel.readyState}")
        if channel.readyState in ["closed", "failed"]:
            print("Channel failed or closed before opening.")
            return
        await asyncio.sleep(0.5)

    print("Channel is OPEN! Streaming data...")

    tick = 0
    try:
        while channel.readyState == "open":
            tick += 1
            raw_x = 100 + 50 * math.cos(tick * 0.1)
            raw_y = 100 + 50 * math.sin(tick * 0.1)
            x_int = int(raw_x)
            y_int = int(raw_y)
            binary_data = struct.pack('<iii', tick, x_int, y_int)
            channel.send(binary_data)
            await asyncio.sleep(1/60)
    except Exception as e:
        print(f"Game loop error: {e}")
    print("Game loop ended.")


async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection(
        configuration=RTCConfiguration(
            iceServers=[RTCIceServer(urls="stun:stun.l.google.com:19302")]
        )
    )
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(channel):
        print(f"NEW CHANNEL: {channel.label}")
        if channel.label == "game":
            asyncio.create_task(run_game_loop(channel))

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"Connection state: {pc.connectionState}")
        if pc.connectionState in ["failed", "closed"]:
            await pc.close()
            pcs.discard(pc)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })


async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


async def cors_middleware(app, handler):
    async def middleware(request):
        if request.method == 'OPTIONS':
            response = web.Response()
        else:
            response = await handler(request)

        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080'
        response.headers['Access-Control-Allow-Methods'] = 'POST, GET, DELETE, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'content-type, authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    return middleware


pcs = set()
app = web.Application(middlewares=[cors_middleware])
app.router.add_post("/offer", offer)
app.on_shutdown.append(on_shutdown)


async def index(request):
    content = open(
            os.path.join(
                os.path.dirname(__file__),
                "../frontend/dist/index.html"
            ),
            "r"
    ).read()
    return web.Response(content_type="text/html", text=content)


async def handle_static(request):
    dist_dir = os.path.join(
            os.path.dirname(__file__),
            "../frontend/dist/assets"
    )
    tail = request.match_info.get('tail', '')
    filepath = os.path.join(dist_dir, tail)
    if tail and os.path.exists(filepath) and os.path.isfile(filepath):
        return web.FileResponse(filepath)
    return web.FileResponse(os.path.join(dist_dir, "index.html"))

app.router.add_get("/", index)
app.router.add_get('/assets/{tail:.*}', handle_static)


if __name__ == "__main__":
    print("Server started at http://0.0.0.0:8000")
    web.run_app(app, host="0.0.0.0", port=8000)
