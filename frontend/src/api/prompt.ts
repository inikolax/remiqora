import { apiFetch, apiJson } from './http'

export interface PromptPrepareResult {
  style_en: string
  lyrics: string
  simple: string
  vocal_language: string
}

export interface PromptLang {
  code: string
  label: string
}

export interface PromptStatus {
  reachable: boolean
  engine?: string
  local_ready?: boolean
  model: string
  model_present?: boolean
  models?: string[]
  supported_langs?: PromptLang[]
  error?: string
}

export async function preparePrompt(text: string, target: string, model?: string, srcLang?: string): Promise<PromptPrepareResult> {
  return apiJson<PromptPrepareResult>('/api/prompt/prepare', { text, target, model: model || '', src_lang: srcLang || 'auto' })
}

export async function promptStatus(): Promise<PromptStatus> {
  return apiFetch<PromptStatus>('/api/prompt/status')
}
