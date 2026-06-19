import { midiSamplePath, PIANO_MAX_MIDI, PIANO_MIN_MIDI } from "@/lib/theory-game/rounds";

export class PianoSampler {
  private context: AudioContext | null = null;
  private buffers = new Map<number, AudioBuffer>();
  private loading: Promise<void> | null = null;
  private activeSources: AudioBufferSourceNode[] = [];

  async load() {
    if (this.buffers.size === PIANO_MAX_MIDI - PIANO_MIN_MIDI + 1) return;
    if (this.loading) return this.loading;

    this.context ??= new AudioContext();
    const context = this.context;
    this.loading = Promise.all(
      Array.from({ length: PIANO_MAX_MIDI - PIANO_MIN_MIDI + 1 }, (_, index) => PIANO_MIN_MIDI + index).map(
        async (midi) => {
          const response = await fetch(midiSamplePath(midi));
          if (!response.ok) throw new Error(`Could not load piano sample ${midi}`);
          const buffer = await context.decodeAudioData(await response.arrayBuffer());
          this.buffers.set(midi, buffer);
        },
      ),
    ).then(() => undefined);

    try {
      await this.loading;
    } finally {
      this.loading = null;
    }
  }

  private stopActiveSources() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // A source that has already ended does not need to be stopped again.
      }
    });
    this.activeSources = [];
  }

  async play(midis: number[]) {
    if (!this.context || this.buffers.size === 0) await this.load();
    const context = this.context;
    if (!context) return;
    await context.resume();
    this.stopActiveSources();

    const gain = context.createGain();
    gain.gain.value = midis.length > 1 ? 0.58 : 0.8;
    gain.connect(context.destination);
    const startAt = context.currentTime + 0.025;

    this.activeSources = midis.map((midi) => {
      const buffer = this.buffers.get(midi);
      if (!buffer) throw new Error(`Piano sample ${midi} is unavailable`);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start(startAt);
      return source;
    });
  }

  close() {
    this.stopActiveSources();
    void this.context?.close();
    this.context = null;
    this.buffers.clear();
  }
}
