import React, { useState } from 'react'
import { Radio, Play, Pause, Filter, Trash2, Activity } from 'lucide-react'

export interface KafkaEvent {
  sensor_id: string
  partition_key: string
  timestamp: string
  car_count: number
  bike_count: number
  bus_count: number
  truck_count: number
  total_vehicles: number
  ground_truth_situation: string
  velocity_kmh?: number
  partition_id?: number
}

interface KafkaStreamCardProps {
  events: KafkaEvent[]
  isStreaming: boolean
  onToggleStreaming: () => void
  streamSpeed?: number
  onChangeSpeed?: (speed: number) => void
  onClearStream?: () => void
}

export const KafkaStreamCard: React.FC<KafkaStreamCardProps> = ({
  events,
  isStreaming,
  onToggleStreaming,
  streamSpeed = 800,
  onChangeSpeed,
  onClearStream
}) => {
  const [selectedPartition, setSelectedPartition] = useState<string>('ALL')

  const partitions = [
    { id: 'ALL', label: 'All (p0–p4)' },
    { id: 'p0', label: 'p0 · Potheri GST' },
    { id: 'p1', label: 'p1 · Guduvanchery' },
    { id: 'p2', label: 'p2 · Maraimalai Nagar' },
    { id: 'p3', label: 'p3 · Paranur MWC' },
    { id: 'p4', label: 'p4 · Kilambakkam KCBT' },
  ]

  const filteredEvents = events.filter(evt => {
    if (selectedPartition === 'ALL') return true
    if (selectedPartition === 'p0') return evt.partition_key.toLowerCase().includes('potheri')
    if (selectedPartition === 'p1') return evt.partition_key.toLowerCase().includes('guduvanchery')
    if (selectedPartition === 'p2') return evt.partition_key.toLowerCase().includes('maraimalai')
    if (selectedPartition === 'p3') return evt.partition_key.toLowerCase().includes('paranur') || evt.partition_key.toLowerCase().includes('mwc')
    if (selectedPartition === 'p4') return evt.partition_key.toLowerCase().includes('kilambakkam') || evt.partition_key.toLowerCase().includes('kcbt')
    return true
  })

  const throughputRate = isStreaming ? (streamSpeed <= 300 ? 32 : streamSpeed <= 800 ? 16 : 8) : 0
  const bandwidthKb = (throughputRate * 1.84).toFixed(1)

  return (
    <div className="relative border border-[#D5D5CF] bg-[#FFFFFF] p-5 sm:p-6 shadow-sm">
      {/* 4 Speakeasy Corner Notch Markers */}
      <span className="speakeasy-notch-marker -top-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -top-1 -right-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -left-1" aria-hidden="true" />
      <span className="speakeasy-notch-marker -bottom-1 -right-1" aria-hidden="true" />

      {/* Card Header with Real Play / Pause Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E5DF]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-[#E5E5DF] bg-[#FBFBFA] text-[#E05238]">
            <Radio className={`w-5 h-5 ${isStreaming ? 'animate-pulse text-[#E05238]' : 'text-[#8C8C85]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#111111] text-base font-sans">
                Apache Kafka Distributed Telemetry Broker
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isStreaming
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {isStreaming ? '● Streaming Ingest Active' : '❚❚ Stream Paused'}
              </span>
            </div>
            <p className="text-xs text-[#666662] font-mono">
              Topic: <span className="font-bold text-[#111111]">tamil-nadu-corridor-telemetry</span> · Edge Cluster Brokers: 3 · Replicas: 3
            </p>
          </div>
        </div>

        {/* Live Action Buttons: Play/Pause, Speed, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {onChangeSpeed && (
            <div className="flex items-center border border-[#D5D5CF] bg-[#FBFBFA] p-0.5">
              {[
                { label: '300ms', val: 300 },
                { label: '800ms', val: 800 },
                { label: '1.5s', val: 1500 }
              ].map(s => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => onChangeSpeed(s.val)}
                  className={`px-2 py-1 text-[10px] font-mono font-semibold transition-all ${
                    streamSpeed === s.val
                      ? 'bg-[#111111] text-white'
                      : 'text-[#666662] hover:text-[#111111]'
                  }`}
                  title={`Set streaming tick to ${s.label}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
              isStreaming
                ? 'bg-[#E05238] hover:bg-[#c93c24] text-white border-[#E05238]'
                : 'bg-[#2F7C4E] hover:bg-[#25633e] text-white border-[#2F7C4E]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          {onClearStream && (
            <button
              type="button"
              onClick={onClearStream}
              className="p-1.5 border border-[#D5D5CF] bg-[#FFFFFF] hover:bg-[#F4F4F0] text-[#666662] hover:text-[#111111]"
              title="Clear Ingested Buffer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Streaming Health & Throughput Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 border border-[#E5E5DF] bg-[#FBFBFA] text-xs font-mono">
        <div>
          <span className="text-[#8C8C85] text-[10px] uppercase block">Ingestion Rate</span>
          <span className="text-[#111111] font-bold text-sm flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#E05238]" />
            {throughputRate} msgs/sec
          </span>
        </div>
        <div>
          <span className="text-[#8C8C85] text-[10px] uppercase block">Network Bandwidth</span>
          <span className="text-[#111111] font-bold text-sm">
            {bandwidthKb} KB/s
          </span>
        </div>
        <div>
          <span className="text-[#8C8C85] text-[10px] uppercase block">Buffer Depth</span>
          <span className="text-[#111111] font-bold text-sm">
            {events.length} frames queued
          </span>
        </div>
        <div>
          <span className="text-[#8C8C85] text-[10px] uppercase block">Active Broker</span>
          <span className="text-emerald-700 font-bold text-sm">
            kafka-broker-01.tn:9092
          </span>
        </div>
      </div>

      {/* Partition Filter Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-[#F4F4F0] no-scrollbar">
        <span className="text-[10px] font-mono font-bold text-[#8C8C85] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" />
          Partitions:
        </span>
        {partitions.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPartition(p.id)}
            className={`px-2.5 py-1 text-[11px] font-mono border whitespace-nowrap transition-all ${
              selectedPartition === p.id
                ? 'border-[#111111] bg-[#111111] text-white font-bold'
                : 'border-[#D5D5CF] bg-[#FFFFFF] text-[#666662] hover:text-[#111111]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Streaming Events Feed List */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#8C8C85] border border-dashed border-[#D5D5CF]">
            No live telemetry events currently buffered for partition {selectedPartition}.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 border border-[#E5E5DF] bg-[#FFFFFF] hover:border-[#111111] transition-all text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono px-2 py-0.5 bg-[#F4F4F0] text-[#111111] border border-[#E5E5DF] font-semibold text-[11px] flex-shrink-0">
                  {evt.sensor_id}
                </span>
                <div className="min-w-0">
                  <span className="text-[#111111] font-semibold block truncate">
                    {evt.partition_key}
                  </span>
                  <span className="text-[10px] text-[#8C8C85] font-mono">
                    {evt.timestamp} · Offset #{489200 + idx} · Velocity: {evt.velocity_kmh || 38} km/h
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right font-mono">
                  <span className="text-[#111111] font-bold block">{evt.total_vehicles} veh/min</span>
                  <span className="text-[10px] text-[#666662]">
                    {evt.car_count}c · {evt.bike_count}b · {evt.bus_count}bus · {evt.truck_count}trk
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                  evt.ground_truth_situation === 'heavy' || evt.ground_truth_situation === 'critical'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : evt.ground_truth_situation === 'high'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {evt.ground_truth_situation}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default KafkaStreamCard
