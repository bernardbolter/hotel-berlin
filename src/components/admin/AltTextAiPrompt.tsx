'use client'

import { useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

import { ART_ALT_AI_PROMPT, artPhotoHelp, artPhotoHelpLocale } from '@/lib/art/photoHelp'

/**
 * Collapsed “create alt text with AI” row: explanation + copyable prompt.
 * No model is called — clipboard only.
 */
export function AltTextAiPrompt() {
  const { i18n } = useTranslation()
  const t = artPhotoHelp[artPhotoHelpLocale(i18n?.language)]
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(ART_ALT_AI_PROMPT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <details
      style={{
        marginTop: 12,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '8px 12px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          listStylePosition: 'outside',
        }}
      >
        {t.ai.summary}
      </summary>
      <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.45 }}>
        {t.ai.explanation.split('\n\n').map((para) => (
          <p key={para.slice(0, 24)} style={{ margin: '0 0 10px', color: 'var(--theme-elevation-800)' }}>
            {para}
          </p>
        ))}
        <pre
          style={{
            margin: '0 0 10px',
            padding: 12,
            borderRadius: 4,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            whiteSpace: 'pre-wrap',
            fontSize: 12,
            lineHeight: 1.4,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {ART_ALT_AI_PROMPT}
        </pre>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          onClick={() => void copyPrompt()}
        >
          {copied ? t.ai.copied : t.ai.copy}
        </button>
      </div>
    </details>
  )
}

export default AltTextAiPrompt
