"""Narasi konten Foreverse (tanpa merekam suara sendiri).
Model: alkhrzmy/qwen3-tts-0.6b-indonesian (Apache-2.0), jalan di CPU.
Tiap baris didengar ulang dengan Whisper; diulang sampai 6 kali, yang paling jelas disimpan.
Siapkan sekali:  python3 -m venv tts && tts/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
                 tts/bin/pip install qwen-tts soundfile faster-whisper scipy
Pakai:  tts/bin/python video/suara.py naskah.json rekaman/video/<id> [nomor baris…]
        naskah.json = video/konten/<id>.json (kolom naskah tiap adegan) atau daftar kalimat → baris-01.wav, baris-02.wav, …"""
import json, sys, os, torch, soundfile as sf, numpy as np, random
torch.set_num_threads(2)
from qwen_tts import Qwen3TTSModel
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
baris = json.load(open(sys.argv[1])); baris = [a.get('naskah','') for a in baris['adegan']] if isinstance(baris, dict) else baris; out = sys.argv[2]; hanya = [int(x) for x in sys.argv[3:]]
m = Qwen3TTSModel.from_pretrained("alkhrzmy/qwen3-tts-0.6b-indonesian", device_map="cpu", dtype=torch.float32)
w = WhisperModel("small", device="cpu", compute_type="int8")
for i, teks in enumerate(baris, 1):
    if (hanya and i not in hanya) or not teks: continue
    terbaik=(-1,None)
    for coba in range(6):
        torch.manual_seed(7 + coba*101); random.seed(7 + coba)
        a, sr = m.generate_custom_voice(text=teks, language="auto", speaker="indonesian_speaker")
        a = a[0]
        seg,_ = w.transcribe(resample_poly(a, 16000, sr).astype("float32"), language="id")
        dengar = " ".join(s.text.strip() for s in seg)
        bersih = lambda s: "".join(c for c in s.lower() if c.isalnum() or c==" ").split()
        cocok = len(set(bersih(teks)) & set(bersih(dengar))) / len(set(bersih(teks)))
        print(f"{i} coba{coba} {len(a)/sr:.2f}s cocok={cocok:.2f} → {dengar}", flush=True)
        if cocok > terbaik[0]: terbaik=(cocok,a)
        if cocok >= 0.85: break
    sf.write(os.path.join(out, f"baris-{i:02d}.wav"), terbaik[1], sr)
