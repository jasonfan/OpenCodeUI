import { memo, useCallback, useSyncExternalStore, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownIcon, ArrowUpIcon, PermissionListIcon, QuestionIcon } from '../../../components/Icons'
import { UndoStatus } from './UndoStatus'
import { usePresence } from '../../../hooks'
import { themeStore, type GlobalMessageDisplay } from '../../../store/themeStore'
import type { CollapsedDialogInfo } from '../InputBox'

// ============================================
// PresenceItem — 通用的入场/退场动画包装器
// ============================================

export function PresenceItem({ show, children }: { show: boolean; children: ReactNode }) {
  const { shouldRender, ref } = usePresence<HTMLDivElement>(show, {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 0.15,
  })
  if (!shouldRender) return null
  return (
    <div ref={ref} className="shrink-0">
      {children}
    </div>
  )
}

// ============================================
// ScrollToBottomButton — 可复用的滚动到底部按钮
// ============================================

interface ScrollToBottomButtonProps {
  onClick?: () => void
}

export const ScrollToBottomButton = memo(function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  const { t } = useTranslation(['chat', 'common'])
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[32px] w-[32px] min-w-[32px] rounded-full bg-accent-main-100/10 border border-accent-main-100/20 backdrop-blur-md flex items-center justify-center text-accent-main-000 hover:bg-accent-main-100/20 transition-colors shrink-0"
      aria-label={t('inputActions.scrollToBottom')}
    >
      <ArrowDownIcon size={16} />
    </button>
  )
})

// ============================================
// FloatingActions — 输入框上方的浮动操作栏
// permission capsule / question capsule / undo status / scroll-to-bottom
// ============================================

interface FloatingActionsProps {
  showScrollToBottom?: boolean
  isCollapsed: boolean
  canRedo?: boolean
  revertSteps?: number
  onRedo?: () => void
  onRedoAll?: () => void
  onScrollToBottom?: () => void
  collapsedPermission?: CollapsedDialogInfo
  collapsedQuestion?: CollapsedDialogInfo
}

export const FloatingActions = memo(function FloatingActions({
  showScrollToBottom,
  isCollapsed,
  canRedo,
  revertSteps,
  onRedo,
  onRedoAll,
  onScrollToBottom,
  collapsedPermission,
  collapsedQuestion,
}: FloatingActionsProps) {
  const globalMessageDisplay = useSyncExternalStore(
    themeStore.subscribe,
    () => themeStore.globalMessageDisplay,
  )

  const cycleGlobalDisplay = useCallback(() => {
    const next: GlobalMessageDisplay =
      globalMessageDisplay === 'auto' ? 'expanded' :
      globalMessageDisplay === 'expanded' ? 'collapsed' :
      'auto'
    themeStore.setGlobalMessageDisplay(next)
  }, [globalMessageDisplay])

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Global Expand/Collapse Toggle */}
      <PresenceItem show={true}>
        <button
          type="button"
          onClick={cycleGlobalDisplay}
          className={`h-[32px] w-[32px] min-w-[32px] rounded-full border backdrop-blur-md flex items-center justify-center transition-colors shrink-0 ${
            globalMessageDisplay === 'auto'
              ? 'bg-bg-050/60 border-border-200/40 text-text-400 hover:text-text-200 hover:bg-bg-000'
              : 'bg-accent-main-100/10 border-accent-main-100/20 text-accent-main-000 hover:bg-accent-main-100/20'
          }`}
          title={
            globalMessageDisplay === 'expanded' ? 'Collapse all' :
            globalMessageDisplay === 'collapsed' ? 'Auto' :
            'Expand all'
          }
          aria-label={
            globalMessageDisplay === 'expanded' ? 'Collapse all messages' :
            globalMessageDisplay === 'collapsed' ? 'Reset to auto' :
            'Expand all messages'
          }
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {globalMessageDisplay === 'expanded' ? (
              <>
                <line x1="3" y1="2" x2="3" y2="14" />
                <line x1="13" y1="2" x2="13" y2="14" />
                <polyline points="7,6 4,8 7,10" />
                <polyline points="9,6 12,8 9,10" />
              </>
            ) : globalMessageDisplay === 'collapsed' ? (
              <>
                <line x1="3" y1="2" x2="3" y2="14" />
                <line x1="13" y1="2" x2="13" y2="14" />
                <polyline points="6,5 10,8 6,11" />
              </>
            ) : (
              <>
                <line x1="3" y1="2" x2="3" y2="14" />
                <line x1="13" y1="2" x2="13" y2="14" />
                <polyline points="7,5 4,8 7,11" />
                <polyline points="9,5 12,8 9,11" />
              </>
            )}
          </svg>
        </button>
      </PresenceItem>

      {/* Collapsed Permission Capsule */}
      <PresenceItem show={!!collapsedPermission}>
        {collapsedPermission && (
          <button
            type="button"
            onClick={collapsedPermission.onExpand}
            className="flex items-center gap-1.5 px-3 h-[32px] rounded-full bg-accent-main-100/10 backdrop-blur-md border border-accent-main-100/20 text-[length:var(--fs-sm)] leading-[14px] text-accent-main-000 hover:bg-accent-main-100/20 transition-colors"
          >
            <PermissionListIcon size={14} />
            <span className="whitespace-nowrap">{collapsedPermission.label}</span>
            {collapsedPermission.queueLength > 1 && (
              <span className="text-[length:var(--fs-xxs)] opacity-70">+{collapsedPermission.queueLength - 1}</span>
            )}
          </button>
        )}
      </PresenceItem>

      {/* Collapsed Question Capsule */}
      <PresenceItem show={!!collapsedQuestion}>
        {collapsedQuestion && (
          <button
            type="button"
            onClick={collapsedQuestion.onExpand}
            className="flex items-center gap-1.5 px-3 h-[32px] rounded-full bg-accent-main-100/10 backdrop-blur-md border border-accent-main-100/20 text-[length:var(--fs-sm)] leading-[14px] text-accent-main-000 hover:bg-accent-main-100/20 transition-colors"
          >
            <QuestionIcon size={14} />
            <span className="whitespace-nowrap">{collapsedQuestion.label}</span>
            {collapsedQuestion.queueLength > 1 && (
              <span className="text-[length:var(--fs-xxs)] opacity-70">+{collapsedQuestion.queueLength - 1}</span>
            )}
          </button>
        )}
      </PresenceItem>

      <PresenceItem show={!!canRedo}>
        {canRedo && <UndoStatus revertSteps={revertSteps ?? 0} onRedo={onRedo} onRedoAll={onRedoAll} />}
      </PresenceItem>

      <PresenceItem show={!!showScrollToBottom && !isCollapsed}>
        <ScrollToBottomButton onClick={onScrollToBottom} />
      </PresenceItem>
    </div>
  )
})

// ============================================
// CollapsedCapsule — 移动端收起状态的胶囊 UI
// ============================================

interface CollapsedCapsuleProps {
  onExpand: () => void
  showScrollToBottom?: boolean
  onScrollToBottom?: () => void
}

export const CollapsedCapsule = memo(function CollapsedCapsule({
  onExpand,
  showScrollToBottom,
  onScrollToBottom,
}: CollapsedCapsuleProps) {
  const { t } = useTranslation(['chat', 'common'])
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onExpand}
        className="flex items-center gap-1.5 px-3 h-[32px] rounded-full glass border border-border-200/50 shadow-lg text-text-300 hover:text-text-200 hover:bg-bg-000 active:scale-95 transition-all"
      >
        <ArrowUpIcon size={14} />
        <span className="text-[length:var(--fs-xs)]">{t('inputActions.reply')}</span>
      </button>
      {showScrollToBottom && <ScrollToBottomButton onClick={onScrollToBottom} />}
    </div>
  )
})
