import { err, ok, type Result } from '@/domain/result'

export type ShareError = { kind: 'unavailable' | 'rejected'; cause?: unknown }

export async function copyText(
  text: string,
  clipboard: Pick<Clipboard, 'writeText'> | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator.clipboard,
): Promise<Result<void, ShareError>> {
  if (!clipboard?.writeText) return err({ kind: 'unavailable' })
  try {
    await clipboard.writeText(text)
    return ok(undefined)
  } catch (cause) {
    return err({ kind: 'rejected', cause })
  }
}

export async function shareContent(
  data: ShareData,
  share: ((data: ShareData) => Promise<void>) | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator.share?.bind(navigator),
): Promise<Result<void, ShareError>> {
  if (!share) return err({ kind: 'unavailable' })
  try {
    await share(data)
    return ok(undefined)
  } catch (cause) {
    return err({ kind: 'rejected', cause })
  }
}
