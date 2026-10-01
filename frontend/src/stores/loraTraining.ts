import { acceptHMRUpdate, defineStore } from 'pinia'
import * as api from '../api/aceStepTraining'
import { i18n } from '../i18n'

const t = i18n.global.t

const AUTOLABEL_POLL_MS = 2000
const PREPROCESS_POLL_MS = 2000
const TRAINING_POLL_MS = 3000

export const useLoraTrainingStore = defineStore('loraTraining', {
  state: () => ({
    // Dataset
    samples: [] as api.DatasetSample[],
    datasetPath: '',
    scanning: false,
    scanError: '',

    // Auto-label
    autoLabelStarting: false,
    autoLabelRunning: false,
    autoLabelTaskId: '',
    autoLabelCurrent: 0,
    autoLabelTotal: 0,
    autoLabelProgressMsg: '',
    autoLabelLastSample: null as api.DatasetSample | null,
    autoLabelError: '',
    _autoLabelTimer: null as ReturnType<typeof setTimeout> | null,

    // Preprocess
    preprocessStarting: false,
    preprocessRunning: false,
    preprocessTaskId: '',
    preprocessCurrent: 0,
    preprocessTotal: 0,
    preprocessOutputDir: '',
    preprocessError: '',
    _preprocessTimer: null as ReturnType<typeof setTimeout> | null,

    // Training
    trainingStarting: false,
    training: null as api.TrainingStatus | null,
    trainingError: '',
    _trainingTimer: null as ReturnType<typeof setTimeout> | null,

    // Export
    exporting: false,
    exportError: '',
    lastExportedPath: '',
  }),
  getters: {
    isTraining(state): boolean {
      return state.training?.is_training ?? false
    },
    totalEpochs(state): number {
      const cfg = state.training?.config as { train_epochs?: number } | undefined
      return cfg?.train_epochs ?? 0
    },
  },
  actions: {
    async scanDataset(req: api.ScanDatasetRequest) {
      this.scanning = true
      this.scanError = ''
      try {
        const res = await api.scanDataset(req)
        this.samples = res.samples
        return res
      } catch (err) {
        this.scanError = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.scanning = false
      }
    },
    async loadDataset(path: string) {
      this.scanning = true
      this.scanError = ''
      try {
        const res = await api.loadDataset(path)
        this.samples = res.samples
        this.datasetPath = path
        return res
      } catch (err) {
        this.scanError = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.scanning = false
      }
    },
    async saveDataset(req: api.SaveDatasetRequest) {
      await api.saveDataset(req)
      this.datasetPath = req.save_path
    },
    async updateSample(idx: number, req: api.UpdateSampleRequest) {
      const updated = await api.updateSample(idx, req)
      const i = this.samples.findIndex((s) => s.index === idx)
      if (i !== -1) this.samples[i] = updated
    },

    async startAutoLabel(req: api.AutoLabelRequest) {
      this.autoLabelError = ''
      this.autoLabelLastSample = null
      this.autoLabelStarting = true
      try {
        const res = await api.startAutoLabel(req)
        if (!res.task_id || res.total === 0) {
          this.autoLabelError = res.message || t('storeErrors.noSamplesToLabel')
          return
        }
        this.autoLabelTaskId = res.task_id
        this.autoLabelRunning = true
        this.autoLabelCurrent = 0
        this.autoLabelTotal = res.total
        this._pollAutoLabel()
      } catch (err) {
        this.autoLabelError = err instanceof Error ? err.message : String(err)
      } finally {
        this.autoLabelStarting = false
      }
    },
    _pollAutoLabel() {
      const tick = async () => {
        try {
          const st = await api.autoLabelStatus(this.autoLabelTaskId)
          this.autoLabelCurrent = st.current
          this.autoLabelTotal = st.total
          this.autoLabelProgressMsg = st.progress
          if (st.last_updated_sample) this.autoLabelLastSample = st.last_updated_sample
          if (st.status === 'completed') {
            this.autoLabelRunning = false
            if (st.result) this.samples = st.result.samples
            return
          }
          if (st.status === 'failed') {
            this.autoLabelRunning = false
            this.autoLabelError = st.error || t('storeErrors.labelingFailed')
            return
          }
        } catch (err) {
          this.autoLabelRunning = false
          this.autoLabelError = err instanceof Error ? err.message : String(err)
          return
        }
        this._autoLabelTimer = setTimeout(tick, AUTOLABEL_POLL_MS)
      }
      void tick()
    },

    async startPreprocess(req: api.PreprocessRequest) {
      this.preprocessError = ''
      this.preprocessStarting = true
      try {
        const res = await api.startPreprocess(req)
        if (!res.task_id || res.total === 0) {
          this.preprocessError = res.message || t('storeErrors.noLabeledSamples')
          return
        }
        this.preprocessTaskId = res.task_id
        this.preprocessRunning = true
        this.preprocessCurrent = 0
        this.preprocessTotal = res.total
        this._pollPreprocess(req.output_dir)
      } catch (err) {
        this.preprocessError = err instanceof Error ? err.message : String(err)
      } finally {
        this.preprocessStarting = false
      }
    },
    _pollPreprocess(outputDir: string) {
      const tick = async () => {
        try {
          const st = await api.preprocessStatus(this.preprocessTaskId)
          this.preprocessCurrent = st.current
          this.preprocessTotal = st.total
          if (st.status === 'completed') {
            this.preprocessRunning = false
            const produced = st.result?.num_tensors
            const message = st.result?.message || st.progress
            if (produced === 0) {
              this.preprocessError = message || t('storeErrors.preprocessFailed')
              return
            }
            this.preprocessOutputDir = st.result?.output_dir || outputDir
            if (message && /failed/i.test(message)) this.preprocessError = message
            return
          }
          if (st.status === 'failed') {
            this.preprocessRunning = false
            this.preprocessError = st.error || t('storeErrors.preprocessFailed')
            return
          }
        } catch (err) {
          this.preprocessRunning = false
          this.preprocessError = err instanceof Error ? err.message : String(err)
          return
        }
        this._preprocessTimer = setTimeout(tick, PREPROCESS_POLL_MS)
      }
      void tick()
    },

    async startTraining(req: api.StartLoraTrainingRequest) {
      this.trainingError = ''
      this.trainingStarting = true
      try {
        await api.startLoraTraining(req)
        this._ensureTrainingPoll()
        await this.refreshTrainingStatus()
      } catch (err) {
        this.trainingError = err instanceof Error ? err.message : String(err)
      } finally {
        this.trainingStarting = false
      }
    },
    async stopTraining() {
      try {
        await api.stopTraining()
      } catch (err) {
        this.trainingError = err instanceof Error ? err.message : String(err)
      }
    },
    async refreshTrainingStatus() {
      try {
        this.training = await api.trainingStatus()
        if (this.training.error) this.trainingError = this.training.error
        else if (typeof this.training.status === 'string' && this.training.status.startsWith('❌')) {
          this.trainingError = this.training.status
        }
      } catch {
        // Model may be offline - leave last known state as-is.
      }
    },
    _ensureTrainingPoll() {
      if (this._trainingTimer) return
      const tick = async () => {
        await this.refreshTrainingStatus()
        this._trainingTimer = this.training?.is_training
          ? setTimeout(tick, TRAINING_POLL_MS)
          : null
      }
      this._trainingTimer = setTimeout(tick, 0)
    },

    async exportAndRegister(exportPath: string, loraOutputDir: string, registryName: string, addToRegistry: (name: string, path: string) => void) {
      this.exporting = true
      this.exportError = ''
      try {
        const res = await api.exportLora({ export_path: exportPath, lora_output_dir: loraOutputDir })
        const adapterPath = res.export_path.replace(/[\\/]+$/, '') + '/adapter'
        addToRegistry(registryName, adapterPath)
        this.lastExportedPath = adapterPath
      } catch (err) {
        this.exportError = err instanceof Error ? err.message : String(err)
        throw err
      } finally {
        this.exporting = false
      }
    },

    stopBackgroundTasks() {
      if (this._autoLabelTimer) clearTimeout(this._autoLabelTimer)
      if (this._preprocessTimer) clearTimeout(this._preprocessTimer)
      if (this._trainingTimer) clearTimeout(this._trainingTimer)
      this._autoLabelTimer = null
      this._preprocessTimer = null
      this._trainingTimer = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLoraTrainingStore, import.meta.hot))
}
