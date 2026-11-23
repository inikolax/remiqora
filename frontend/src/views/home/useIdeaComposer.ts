// "From an idea" on the home page: one field for the idea, song or instrumental, an engine, and the prompt written
// for it in that engine's own format:
// - ACE-Step: style caption, lyrics, BPM, key, length; by the prompt assistant, or by ACE-Step's own language model
//   when the engine runs and that is picked (faster, but it strays from the idea);
// - YuE2 (songs only): 5 to 9 style tags in English and sectioned lyrics, by the prompt assistant;
// - Stable Audio 3 (instrumentals only): its own tag style, by the assistant with Stable Audio's own instructions.
// The prompt is shown as editable fields; "Generate" sends the request the engine's own form sends, then opens
// Create on that engine, where the track lands in the feed.
// The state lives in the idea store (shared with Create's idea line); this holds the rules and the actions. Called
// once by IdeaComposer, which provides it to the prompt panel.
import { defaultTitle } from '../../utils/songTitle'
import { computed, ref, watch } from 'vue'
import type { Component, InjectionKey } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import * as aceApi from '../../api/aceStep'
import type { GenerateMusicRequest } from '../../api/aceStep'
import { PromptCancelled, writePromptLive } from '../../api/assistant'
import type { AssistantTask } from '../../api/assistant'
import type { Sa3ModelId } from '../../api/stableAudio'
import { useAceStepStore } from '../../stores/aceStep'
import { useEnginesStore } from '../../stores/engines'
import { useFeaturesStore } from '../../stores/features'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useYue2Store } from '../../stores/yue2'
import { useIdeaStore } from '../../stores/idea'
import type { IdeaDraft as Draft, IdeaEngine as Engine, IdeaWriter as Writer } from '../../stores/idea'
import { useStableAudioStore } from '../../stores/stableAudio'
import { englishLanguageName, guessVocalLanguage, withLanguageTag } from '../../utils/vocalLanguages'
import MicIcon from '../../components/shared/icons/MicIcon.vue'
import PulseIcon from '../../components/shared/icons/PulseIcon.vue'
import WaveIcon from '../../components/shared/icons/WaveIcon.vue'
import { withLength } from '../../utils/sa3Length'

/** The home page's kinds: the idea store's two, and a sound, which goes straight into Stable Audio's form. */
export type HomeKind = 'song' | 'instrumental' | 'sound'

/** In the app's one engine order (the Create rail's, the help's): YuE2, ACE-Step, Stable Audio. */
export const IDEA_ENGINES: { id: Engine; model: 'ace_step' | 'yue2' | 'stable_audio'; route: string; icon: Component }[] = [
  { id: 'yue2', model: 'yue2', route: 'yue2', icon: MicIcon },
  { id: 'ace', model: 'ace_step', route: 'ace-step', icon: WaveIcon },
  { id: 'sa3', model: 'stable_audio', route: 'stable-audio', icon: PulseIcon },
]
/** Stable Audio's checkpoints for an idea, the better first for each kind: medium makes music and sounds,
 *  small-music only music, small-sfx only sounds (the base ones want CFG and 50 steps, so they stay on its form). */
const SA3_MODELS: { id: Sa3ModelId; max: number; kinds: ('music' | 'sfx')[] }[] = [
  { id: 'medium', max: 380, kinds: ['music', 'sfx'] },
  { id: 'small-music', max: 120, kinds: ['music'] },
  { id: 'small-sfx', max: 120, kinds: ['sfx'] },
]
/** The service tag the assistant put first, per kind (Stable Audio's TRACK_TYPE_PREFIXES). */
const SA3_PREFIX = { music: 'TrackType: Music, VocalType: Instrumental, ', sfx: 'TrackType: SFX, ' } as const

export function useIdeaComposer() {
  const { t } = useI18n()
  const router = useRouter()
  const orchestrator = useOrchestratorStore()
  const ace = useAceStepStore()
  const yue2 = useYue2Store()
  const sa3 = useStableAudioStore()
  const engines = useEnginesStore()
  const features = useFeaturesStore()

  // ---- the idea: in a store, so leaving for an engine's form and coming back keeps it, and the browser keeps it ----
  const ideaStore = useIdeaStore()
  const { idea, kind, language, writerPref, engine, draft, variants, precision, sa3Model, writing, error, progress, stopping } = storeToRefs(ideaStore)
  const instrumental = computed(() => kind.value === 'instrumental')
  const effectiveLanguage = computed(() => language.value || (idea.value.trim() ? guessVocalLanguage(idea.value) : 'en'))

  // ---- the engine ----
  const sa3Installed = computed(() => SA3_MODELS.filter((m) => features.features.stable_audio_models.includes(m.id)))
  /** Music or a sound: as the prompt says, music before there is one. */
  const sa3Kind = computed<'music' | 'sfx'>(() => (draft.value?.engine === 'sa3' && draft.value.sa3Kind) || 'music')
  /** For sounds small-sfx first, it was made for them. */
  const sa3Models = computed(() => {
    const list = sa3Installed.value.filter((m) => m.kinds.includes(sa3Kind.value))
    return sa3Kind.value === 'sfx' ? [...list].sort((a, b) => Number(b.id === 'small-sfx') - Number(a.id === 'small-sfx')) : list
  })
  // the written prompt's engine (a sound is Stable Audio's whatever is picked for songs), else the picked one
  const engineInfo = computed(() => IDEA_ENGINES.find((e) => e.id === (draft.value?.engine ?? engine.value))!)
  /** Installed, and able to make this kind: YuE2 sings, it makes no instrumentals. */
  function engineAvailable(id: Engine): boolean {
    if (id === 'yue2') return features.has('yue2') && !instrumental.value
    if (id === 'sa3') return features.has('stableAudio') && instrumental.value && sa3Installed.value.length > 0
    return true
  }
  function unavailableReason(id: Engine): string {
    if (id === 'yue2' && instrumental.value) return t('idea.yue2OnlySongs')
    if (id === 'sa3' && !instrumental.value) return t('idea.sa3OnlyInstrumentals')
    if (id === 'sa3' && features.has('stableAudio')) return t('idea.sa3NoMusicModel')
    return t('idea.notInstalled')
  }
  function engineRunning(id: Engine): boolean {
    const model = IDEA_ENGINES.find((e) => e.id === id)!.model
    return orchestrator.activeModel === model && orchestrator.statuses[model]?.status === 'running'
  }
  /** An engine that can make this kind: YuE2 makes no instrumentals, Stable Audio no songs. */
  function fitEngine(instr: boolean) {
    if (instr && engine.value === 'yue2') engine.value = engineAvailable('sa3') ? 'sa3' : 'ace'
    if (!instr && engine.value === 'sa3') engine.value = 'ace'
  }
  watch(instrumental, fitEngine)
  watch(engine, (now) => { if (draft.value && draft.value.engine !== now) draft.value = null })
  const yue2Precisions = computed(() => features.features.yue2_precisions)

  // ---- who writes the prompt ----
  const aceRunning = computed(() => engineRunning('ace'))
  /** A downloaded model is enough: the assistant starts on the first request. */
  const assistantReady = computed(() => !!engines.assistant?.ready && !!engines.assistant?.models.some((m) => m.installed))
  /** The assistant's state has come in: before that "nobody can write" is not known yet. */
  const writerKnown = computed(() => engines.assistant != null)
  /** YuE2 has no writer of its own. For ACE-Step: the picked writer when it can write now, else the other one. */
  const writer = computed<Writer | null>(() => {
    if (engine.value !== 'ace') return assistantReady.value ? 'assistant' : null
    const can = { assistant: assistantReady.value, ace: aceRunning.value }
    if (can[writerPref.value]) return writerPref.value
    return can.assistant ? 'assistant' : can.ace ? 'ace' : null
  })
  const writerOptions = computed(() => [
    { value: 'assistant', label: t('idea.writerAssistant'), disabled: !assistantReady.value },
    { value: 'ace', label: t('idea.writerAce'), disabled: !aceRunning.value },
  ])
  /** The assistant set to the GPU: it unloads a running engine to write, and leaves when Generate starts the engine. */
  const assistantOnGpu = computed(() => engines.assistant?.settings.device === 'cuda')
  /** An engine holds the GPU and the assistant is not set to take it: it writes on the CPU, so it takes longer. */
  const assistantOnCpu = computed(() => !!orchestrator.activeModel && !assistantOnGpu.value)

  // ---- the prompt, editable ----
  async function byAssistant(task: AssistantTask, extra: { language?: string; kind?: string }) {
    stopping.value = false
    const run = writePromptLive(task, idea.value.trim(), extra, (p) => { progress.value = p }, {
      unloadsEngine: assistantOnGpu.value && !!orchestrator.activeModel,
    })
    ideaStore.setStop(run.cancel)
    try {
      return (await run.result).fields
    } finally {
      ideaStore.setStop(null)
      progress.value = null
    }
  }
  const stopWriting = () => ideaStore.stop()

  /** `sound`: the home page's Sound kind, always Stable Audio, whatever engine is picked for songs. */
  async function write(opts: { sound?: boolean } = {}) {
    const text = idea.value.trim()
    if (!text) {
      error.value = t('idea.needIdea')
      return
    }
    const toSa3 = opts.sound || engine.value === 'sa3'
    if (toSa3 ? !assistantReady.value : !writer.value) {
      error.value = t('idea.noWriter')
      return
    }
    writing.value = true
    error.value = null
    const t0 = performance.now()
    const seconds = () => (performance.now() - t0) / 1000
    const base = { bpm: null, keyscale: '', duration: 120, timesignature: '', language: instrumental.value ? '' : effectiveLanguage.value }
    try {
      if (toSa3) {
        // Stable Audio is picked here only for an instrumental or a sound, so the kind is told, not guessed: left to
        // its own classifier the assistant read a story-like idea ("leaving town on a night train") as a sound
        const kindOf: 'music' | 'sfx' = opts.sound ? 'sfx' : 'music'
        const f = await byAssistant('sa3', { kind: kindOf })
        const fits = sa3Installed.value.filter((m) => m.kinds.includes(kindOf))
        const max = (fits.find((m) => m.id === sa3Model.value) ?? fits[0])?.max ?? 120
        const dur = typeof f.duration === 'number' ? f.duration : kindOf === 'sfx' ? 10 : 60
        const length = Math.max(kindOf === 'sfx' ? 0.5 : 5, Math.min(max, Math.round(dur)))
        draft.value = {
          ...base, engine: 'sa3', caption: withLength(String(f.prompt ?? ''), length), lyrics: '', sa3Kind: kindOf,
          bpm: typeof f.bpm === 'number' ? f.bpm : null,
          duration: length, writtenBy: 'assistant', seconds: seconds(),
        }
      } else if (engine.value === 'yue2') {
        const f = await byAssistant('yue2-song', { language: effectiveLanguage.value })
        // the language opens the tags: the one the assistant wrote the lyrics in, else the one asked for
        const lang = typeof f.language === 'string' && f.language ? f.language : englishLanguageName(effectiveLanguage.value)
        draft.value = {
          ...base, engine: 'yue2', caption: withLanguageTag(String(f.style ?? ''), lang), lyrics: String(f.lyrics ?? ''),
          writtenBy: 'assistant', seconds: seconds(),
        }
      } else if (writer.value === 'ace') {
        const s = await aceApi.createSample(text, instrumental.value, instrumental.value ? undefined : effectiveLanguage.value)
        draft.value = {
          engine: 'ace',
          caption: s.caption,
          lyrics: instrumental.value ? '' : s.lyrics,
          bpm: s.bpm ?? null,
          keyscale: s.keyscale || '',
          duration: Math.round(s.duration || 120),
          timesignature: s.timesignature || '',
          language: instrumental.value ? '' : s.vocal_language && s.vocal_language !== 'unknown' ? s.vocal_language : effectiveLanguage.value,
          writtenBy: 'ace',
          seconds: seconds(),
        }
      } else {
        const f = await byAssistant(instrumental.value ? 'ace-instrumental' : 'ace-song', { language: effectiveLanguage.value })
        draft.value = {
          ...base,
          engine: 'ace',
          caption: String(f.caption ?? ''),
          lyrics: instrumental.value ? '' : String(f.lyrics ?? ''),
          bpm: typeof f.bpm === 'number' ? f.bpm : null,
          keyscale: String(f.keyscale ?? ''),
          duration: typeof f.duration === 'number' ? f.duration : 120,
          writtenBy: 'assistant',
          seconds: seconds(),
        }
      }
      if (toSa3 || writer.value === 'assistant') {
        void engines.load()
        // on the GPU the assistant may have unloaded the running engine
        if (assistantOnGpu.value) void orchestrator.refresh()
      }
    } catch (e) {
      // stopped by hand: no error, the previous prompt (if any) stays
      if (!(e instanceof PromptCancelled)) error.value = e instanceof Error ? e.message : String(e)
    } finally {
      writing.value = false
    }
  }

  const durationLabel = computed(() => {
    const d = draft.value?.duration ?? 0
    return `${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, '0')}`
  })

  // ---- generate ----
  const variantOptions = [1, 2, 4].map((n) => ({ value: n, label: String(n) }))
  watch(sa3Models, (list) => { if (list.length && !list.some((m) => m.id === sa3Model.value)) sa3Model.value = list[0].id }, { immediate: true })
  // music and sounds have their own best checkpoint: a change of kind picks it
  watch(sa3Kind, () => { if (sa3Models.value.length) sa3Model.value = sa3Models.value[0].id })
  const sa3KindOptions = computed(() => [
    { value: 'music', label: t('idea.sa3Music') },
    { value: 'sfx', label: t('idea.sa3Sound') },
  ])
  function setSa3Kind(value: unknown) {
    const next = value === 'sfx' ? 'sfx' : 'music'
    const d = draft.value
    if (!d || d.engine !== 'sa3' || (d.sa3Kind ?? 'music') === next) return
    const from = SA3_PREFIX[d.sa3Kind ?? 'music']
    if (d.caption.startsWith(from)) d.caption = SA3_PREFIX[next] + d.caption.slice(from.length)
    d.sa3Kind = next
    if (next === 'music' && d.duration < 5) d.duration = 30
  }
  const sa3Max = computed(() => sa3Models.value.find((m) => m.id === sa3Model.value)?.max ?? 120)
  watch(yue2Precisions, (list) => { if (list.length && !list.includes(precision.value)) precision.value = list[0] }, { immediate: true })
  const starting = ref(false)

  function aceRequest(d: Draft): GenerateMusicRequest {
    const req: GenerateMusicRequest = {
      prompt: d.caption.trim(),
      lyrics: instrumental.value ? '' : d.lyrics,
      audio_duration: Math.max(10, Math.min(600, Math.round(d.duration))),
      batch_size: variants.value,
      audio_format: 'mp3',
      use_random_seed: true,
    }
    if (d.bpm) req.bpm = Math.round(d.bpm)
    if (d.keyscale.trim()) req.key_scale = d.keyscale.trim()
    if (d.timesignature) req.time_signature = d.timesignature
    if (!instrumental.value && d.language) req.vocal_language = d.language
    return req
  }

  async function generate() {
    const d = draft.value
    if (!d || !d.caption.trim()) {
      error.value = t('idea.needCaption')
      return
    }
    if (d.engine === 'yue2' && !d.lyrics.trim()) {
      error.value = t('idea.needLyrics')
      return
    }
    error.value = null
    starting.value = true
    const info = IDEA_ENGINES.find((e) => e.id === d.engine)!
    try {
      // the takes go to the backend's queue, which starts the engine when it is their turn
      if (d.engine === 'sa3') {
        await sa3.generate({
          kind: d.sa3Kind ?? 'music', model: sa3Model.value, prompt: withLength(d.caption.trim(), d.duration), caption: idea.value.trim(), autoTags: false,
          negativePrompt: '', duration: Math.max(d.sa3Kind === 'sfx' ? 0.5 : 5, Math.min(sa3Max.value, d.duration)),
          steps: 8, cfgScale: 1, seed: -1, count: variants.value, title: defaultTitle({ lyrics: d.lyrics, idea: idea.value, style: d.caption }),
        })
      } else if (d.engine === 'yue2') {
        await yue2.generateBatch({
          lyrics: d.lyrics.trim(),
          style: d.caption.trim(),
          cot: 'off',
          precision: precision.value,
          baseSeed: Math.floor(Math.random() * 2147483647),
          randomSeed: true,
          batchSize: variants.value,
          options: { style: d.caption.trim(), cot: 'off' },
          title: defaultTitle({ lyrics: d.lyrics, idea: idea.value, style: d.caption }),
        })
      } else {
        await ace.submit(aceRequest(d), null, defaultTitle({ lyrics: d.lyrics, idea: idea.value, style: d.caption }))
      }
      // the job is sent and the track lands in the engine's feed: the form starts clean for the next idea
      ideaStore.reset()
      await router.push({ name: info.route })
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      starting.value = false
    }
  }

  /** The engine's own form with this prompt in it, for the settings left out here. */
  async function openInForm() {
    const d = draft.value
    if (!d) return
    if (d.engine === 'yue2') {
      yue2.requestInsertParams({ lyrics: d.lyrics, style: d.caption, precision: precision.value })
      await router.push({ name: 'yue2' })
      return
    }
    if (d.engine === 'sa3') {
      const length = Math.min(sa3Max.value, Math.round(d.duration))
      sa3.requestInsertParams({ kind: d.sa3Kind ?? 'music', model: sa3Model.value, prompt: withLength(d.caption, length), duration: length })
      await router.push({ name: 'stable-audio' })
      return
    }
    const req = aceRequest(d)
    ace.requestInsertParams({
      prompt: req.prompt,
      lyrics: req.lyrics,
      instrumental: instrumental.value,
      duration: req.audio_duration,
      bpm: req.bpm ?? null,
      key_scale: req.key_scale ?? '',
      time_signature: req.time_signature ?? '',
      vocal_language: req.vocal_language ?? '',
    })
    await router.push({ name: 'ace-step' })
  }

  async function startAce() {
    try {
      await orchestrator.switchModel('ace_step')
    } catch {
      // orchestrator.switchError is shown in the header
    }
  }

  return {
    ideaStore, orchestrator, engines,
    idea, kind, language, writerPref, engine, draft, variants, precision, sa3Model, writing, error, progress, stopping,
    instrumental, effectiveLanguage,
    engineInfo, engineAvailable, unavailableReason, engineRunning, fitEngine, yue2Precisions,
    aceRunning, assistantReady, writerKnown, writer, writerOptions, assistantOnGpu, assistantOnCpu,
    write, stopWriting, durationLabel,
    variantOptions, sa3Kind, sa3Models, sa3KindOptions, setSa3Kind, sa3Max, starting,
    generate, openInForm, startAce,
  }
}

export type IdeaComposer = ReturnType<typeof useIdeaComposer>
export const IDEA_COMPOSER: InjectionKey<IdeaComposer> = Symbol('idea-composer')
