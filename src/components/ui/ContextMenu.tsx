import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[100] p-1 glass border border-border-200/60 rounded-xl shadow-lg"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            item.onClick?.()
            onClose()
          }}
          className="w-full px-2 py-2 rounded-lg flex items-start gap-2 text-left bg-transparent border-none cursor-pointer hover:bg-bg-200 active:scale-[0.98] transition-all duration-150 select-none"
        >
          {item.icon && (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 text-text-400">{item.icon}</span>
          )}
          <div className="text-[length:var(--fs-base)] text-text-200">{item.label}</div>
        </button>
      ))}
    </div>,
    document.body,
  )
}
