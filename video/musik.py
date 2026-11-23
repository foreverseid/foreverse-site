"""Musik latar Foreverse, dibuat dari kode (bebas hak cipta, sama di semua konten).
Kunci lembut ala kotak musik + pad hangat + ketukan halus. Pakai:
  python3 video/musik.py <detik> <keluar.wav> [bpm]"""
import sys, numpy as np, wave
SR = 44100
dur = float(sys.argv[1]); out = sys.argv[2]; bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 84
n = int(SR * (dur + 2)); L = np.zeros(n); R = np.zeros(n)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / bpm
# progresi: Fmaj7 Em7 Dm7 Cmaj7 (dua ketukan x4 per akor)
akor = [[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]]
melodi = [72,76,74,72, 71,74,72,71, 69,72,71,69, 67,71,72,74]   # satu nada per ketukan
def nada(m, t0, d, vol, pan, jenis):
    i0 = int(t0 * SR); k = int(d * SR); t = np.arange(k) / SR
    f = hz(m)
    if jenis == "bel":      # kotak musik: sinus + harmoni, cepat meluruh
        y = (np.sin(2*np.pi*f*t) + .35*np.sin(2*np.pi*2*f*t) + .12*np.sin(2*np.pi*3.01*f*t)) * np.exp(-t*3.2)
        y *= np.minimum(1, t/0.004)
    else:                   # pad: sinus lembut, naik-turun pelan
        y = (np.sin(2*np.pi*f*t) + .3*np.sin(2*np.pi*f*1.003*t)) * np.minimum(1, t/0.35) * np.minimum(1, (d-t)/0.5)
    e = min(n, i0 + k); y = y[:e-i0] * vol
    L[i0:e] += y * (1-pan); R[i0:e] += y * (1+pan)
t = 0.0; i = 0
while t < dur + 1:
    c = akor[(i // 8) % 4]
    if i % 8 == 0:
        for j, m in enumerate(c): nada(m, t, beat*8, .045, (j-1.5)*.2, "pad")
    nada(melodi[i % 16], t, beat*2.5, .11, .25 if i % 2 else -.25, "bel")
    if i % 4 == 2: nada(melodi[(i+3) % 16] + 12, t + beat/2, beat*2, .05, .4, "bel")
    # ketukan halus: kick lembut di 1 & 3, shaker di sela
    k0 = int(t*SR)
    if i % 2 == 0 and i >= 8:
        kk = np.arange(int(.25*SR))/SR; y = np.sin(2*np.pi*(55+70*np.exp(-kk*30))*kk)*np.exp(-kk*14)*.16
        e = min(n, k0+len(y)); L[k0:e] += y[:e-k0]; R[k0:e] += y[:e-k0]
    if i >= 8:
        s0 = int((t+beat/2)*SR); ss = np.random.default_rng(i).standard_normal(int(.06*SR))*np.exp(-np.arange(int(.06*SR))/SR*60)*.018
        ss = np.diff(ss, prepend=0); e = min(n, s0+len(ss)); L[s0:e] += ss[:e-s0]*.8; R[s0:e] += ss[:e-s0]
    t += beat; i += 1
# gema sederhana
d = int(beat*.75*SR)
for a, b in ((L, R), (R, L)):
    a[d:] += b[:-d] * .22
x = np.stack([L, R], 1)[:int(SR*dur)]
fade = int(SR*1.5); x[-fade:] *= np.linspace(1, 0, fade)[:, None]; x[:int(SR*.05)] *= np.linspace(0,1,int(SR*.05))[:,None]
x = x / np.max(np.abs(x)) * .8
w = wave.open(out, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((x*32767).astype("<i2").tobytes()); w.close()
