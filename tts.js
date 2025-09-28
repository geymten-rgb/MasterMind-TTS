document.getElementById('speak-btn').addEventListener('click', async () => {
    const text = document.getElementById('text-input').value.trim();
    if (!text) return alert('Please enter some text!');

    try {
        const response = await fetch('/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS fetch error:', errorText);
            return alert('Error generating speech.');
        }

        const data = await response.json();
        const audio = document.getElementById('tts-audio');
        audio.src = 'data:audio/mp3;base64,' + data.audio;
        audio.play();
    } catch (err) {
        console.error('Frontend error:', err);
        alert('Error communicating with the server.');
    }
});
