import React from 'react'
import { AlertTriangle, Clock, MapPin, ShieldAlert } from 'lucide-react'
import { Incident } from '../../types'

interface IncidentAlertFeedProps {
  incidents: Incident[]
  onSelectIncident?: (incident: Incident) => void
  selectedIncidentId?: string
}

export const IncidentAlertFeed: React.FC<IncidentAlertFeedProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId
}) => {
  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#E05238]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111111] text-base font-sans">Active Incident Feed</h3>
            <p className="text-xs text-[#666662] font-mono">Live AI Vision & Road Hazard Events</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E05238]" />
          {incidents.length} Detected
        </span>
      </div>

      <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {incidents.map((inc) => {
          const isSelected = selectedIncidentId === inc.id
          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident?.(inc)}
              className={`p-3.5 border transition-all cursor-pointer text-xs ${
                isSelected
                  ? 'bg-[#F7F7F4] border-[#111111] shadow-xs'
                  : 'bg-[#FFFFFF] border-[#E5E5DF] hover:border-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2 py-0.5 bg-[#F4F4F0] text-[#111111] border border-[#E5E5DF] font-semibold text-[11px]">
                      {inc.id}
                    </span>
                    <span className="font-semibold text-[#111111]">{inc.type}</span>
                  </div>
                  <span className="text-[11px] text-[#666662] flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3 h-3 text-[#E05238]" /> {inc.location}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 uppercase font-bold border ${
                      inc.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : inc.severity === 'high'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-[#F4F4F0] text-[#666662] border-[#E5E5DF]'
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span className="text-[10px] text-[#8C8C85] flex items-center gap-1 mt-1.5 justify-end font-mono">
                    <Clock className="w-2.5 h-2.5" /> {inc.time}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IncidentAlertFeed
