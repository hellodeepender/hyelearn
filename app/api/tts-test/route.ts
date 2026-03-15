import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(`
    <html><body style="font-family:sans-serif; padding:40px">
      <h1>TTS Test</h1>
      <input id="word" type="text" placeholder="Type any word" style="font-size:24px; padding:8px" />
      <button onclick="play()" style="font-size:24px; padding:8px">Play</button>
      <br/><br/>
      <audio id="player" controls></audio>
      <script>
        function play() {
          var word = document.getElementById('word').value;
          var player = document.getElementById('player');
          player.src = '/api/tts?text=' + encodeURIComponent(word);
          player.play();
        }
      </script>
    </body></html>
  `, { headers: { "Content-Type": "text/html" } });
}
