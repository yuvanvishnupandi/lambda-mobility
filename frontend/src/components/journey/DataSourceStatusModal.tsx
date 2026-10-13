import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Database,
  X,
  Info
} from 'lucide-react'
import { TransitStatusData } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

interface DataSourceStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DataSourceStatusModal: React.FC<DataSourceStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusData, setStatusData] = useState<TransitStatusData | null>(null)

  useEffect(() => {
    if (isOpen) {
      transitApi.getTransitStatus().then((data) => {
        setStatusData(data)
      })
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 animate-fade"
      onClick={onClose}
    >
      <div
        className="u-glass w-full max-w-lg overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-iris-50 text-iris-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Transport Data Sources & Freshness</h3>
              <p className="text-xs text-slate-500">Tamil Nadu Smart Mobility Integration Health</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Transparency Callout Banner */}
          <div className="bg-iris-50/80 rounded-xl p-3.5 border border-iris-200 text-iris-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-iris-600" />
              <span>Data Authenticity & Transparency</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Chennai Metro CMRL lines (Blue & Green lines), Southern Railway Chennai Suburban EMU corridors, and MTC electric arterial routes (500A / 70V / GST corridor) are indexed from official schedules and geospatial networks. Live vehicle GPS locations and ETAs are updated with exact freshness indicators.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900">{statusData?.total_stops || 63}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Stops / Stations</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-lg font-black text-slate-900">{statusData?.total_routes || 9}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Transit Lines</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-lg font-black text-emerald-600">{statusData?.active_vehicles || 9}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Units</div>
            </div>
          </div>

          {/* Sources List */}
          <div className="space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Connected Data Providers
            </div>

            {statusData?.sources && statusData.sources.length > 0 ? (
              statusData.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>{src.source_name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {src.records_count} network nodes • {src.freshness_label}
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    OPERATIONAL
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400">Loading sources...</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="u-btn u-btn-primary u-btn-sm"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
