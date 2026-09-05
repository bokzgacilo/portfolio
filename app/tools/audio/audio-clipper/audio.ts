/** Pure audio helpers, shared by the editor and export verification. */
export type AudioSamples = Pick<AudioBuffer, "sampleRate" | "length" | "numberOfChannels" | "getChannelData">;

export function formatTime(seconds: number) {
  const ms = Math.round(Math.max(0, seconds) * 1000);
  return `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}

export function waveformPeaks(buffer: AudioSamples, count = 1000) {
  const peaks = new Float32Array(Math.min(count, buffer.length));
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let bar = 0; bar < peaks.length; bar++) {
      const from = Math.floor(bar * buffer.length / peaks.length);
      const to = Math.floor((bar + 1) * buffer.length / peaks.length);
      for (let i = from; i < to; i++) peaks[bar] = Math.max(peaks[bar], Math.abs(samples[i]));
    }
  }
  return peaks;
}

export function encodeWav(buffer: AudioSamples, start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > buffer.length / buffer.sampleRate) {
    throw new Error("Choose an end time after the start and within the track.");
  }
  const first = Math.min(buffer.length - 1, Math.round(start * buffer.sampleRate));
  const last = Math.min(buffer.length, Math.round(end * buffer.sampleRate));
  if (last <= first) throw new Error("Select at least one audio sample.");
  const channels = buffer.numberOfChannels;
  const size = (last - first) * channels * 2;
  if (size > 512 * 1024 * 1024) throw new Error("This clip is too large. Select a shorter section (under 512 MB of WAV audio).");
  const bytes = new ArrayBuffer(44 + size);
  const view = new DataView(bytes);
  const label = (at: number, value: string) => [...value].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)));
  label(0, "RIFF"); view.setUint32(4, 36 + size, true); label(8, "WAVE");
  label(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
  label(36, "data"); view.setUint32(40, size, true);
  const samples = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
  let offset = 44;
  for (let frame = first; frame < last; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, samples[channel][frame]));
      view.setInt16(offset, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
      offset += 2;
    }
  }
  return new Blob([bytes], { type: "audio/wav" });
}
