"""Rapikan narasi dari alat TTS luar (mis. Google AI Studio) untuk video konten.
Potong jadi baris per adegan di titik potong (detik), perpendek jeda diam yang terlalu panjang,
lalu simpan sebagai baris-01.wav … ke folder kerja susun.mjs.
Pakai: python3 video/rapikan_vo.py vo.wav <folder> <potong1,potong2,…> [jeda_maks=0.3] [jeda_khusus=no:detik,…]"""
import sys, numpy as np, soundfile as sf, os
a, sr = sf.read(sys.argv[1], dtype="float32")
if a.ndim > 1: a = a.mean(1)
out = sys.argv[2]; potong = [0.0] + [float(x) for x in sys.argv[3].split(",")] + [len(a) / sr]
maks = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
khusus = dict((int(k), float(v)) for k, v in (p.split(":") for p in sys.argv[5].split(","))) if len(sys.argv) > 5 else {}
win = int(sr * 0.02)
def rapikan(x, batas):
    n = len(x) // win
    rms = np.array([np.sqrt(np.mean(x[i*win:(i+1)*win] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms); diam = db < (db.max() - 38)
    # buang diam di awal & akhir, sisakan 40 ms / batas
    bunyi = np.where(~diam)[0]; awal, akhir = max(0, bunyi[0] - 2), min(n, bunyi[-1] + 1)
    potongan, i = [], awal
    while i < akhir:
        if diam[i]:
            j = i
            while j < akhir and diam[j]: j += 1
            lama = j - i; simpan = min(lama, int(batas * sr / win))
            potongan.append(x[i*win:(i+simpan)*win]); i = j
        else:
            j = i
            while j < akhir and not diam[j]: j += 1
            potongan.append(x[i*win:j*win]); i = j
    y = np.concatenate(potongan + [x[akhir*win:akhir*win + int(batas*sr)]])
    f = int(sr * .01); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y
os.makedirs(out, exist_ok=True)
for k in range(len(potong) - 1):
    y = rapikan(a[int(potong[k]*sr):int(potong[k+1]*sr)], khusus.get(k + 1, maks))
    sf.write(os.path.join(out, f"baris-{k+1:02d}.wav"), y, sr)
    print(f"baris-{k+1:02d}: {len(y)/sr:.2f} s")
