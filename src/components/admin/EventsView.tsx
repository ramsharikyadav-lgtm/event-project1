import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HotelEvent } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  ChevronRight, 
  FileText,
  X
} from 'lucide-react';

interface EventsViewProps {
  onOpenNewEvent: () => void;
  onOpenNewOrder: (eventId?: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onOpenNewEvent,
  onOpenNewOrder
}) => {
  const { events, orders, vendors, currentUser } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<HotelEvent | null>(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEvents = events.filter(e => {
    if (typeFilter === 'ALL') return true;
    return e.eventType === typeFilter;
  });

  const canCreateEvents = currentUser.rights.canCreateEvents;
  const canBookVenues = currentUser.rights.canBookVenues;
  const canOrderRequirements = currentUser.rights.canOrderRequirements;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Hotel Event Management</span>
            <span className="text-slate-300">·</span>
            <span>Venues &amp; Spaces</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Booked Venues &amp; Events
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Schedule hotel events, reserve configured venues, and dispatch requirement orders to registered service providers.
          </p>
        </div>

        {canCreateEvents && (
          <button
            onClick={onOpenNewEvent}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{canBookVenues ? 'Book Venue & Create Event' : 'Create Event'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-x-auto">
        {['ALL', 'CONFERENCE', 'GALA', 'WEDDING', 'BANQUET', 'EXHIBITION'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              typeFilter === type
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {type === 'ALL' ? 'All Events' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Events Grid or Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2.5">
          <Calendar className="w-9 h-9 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No events scheduled yet</p>
          <p className="max-w-md mx-auto text-slate-500">
            {events.length === 0
              ? 'Create your first hotel event and book a venue to start dispatching vendor requirement orders.'
              : 'No events match the selected category filter.'}
          </p>
          {canCreateEvents && events.length === 0 && (
            <button
              onClick={onOpenNewEvent}
              className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{canBookVenues ? 'Book Venue & Create Event' : 'Create Event'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(event => {
            const eventOrders = orders.filter(o => o.eventId === event.id);
            const approvedCount = eventOrders.filter(o => o.status === 'MANAGEMENT_APPROVED').length;

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-800 uppercase tracking-wide text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {event.eventType}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {event.startDate.replace('T', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {event.title}
                    </h3>
                    <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Specs row */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Confirmed Guests</span>
                      <div className="font-bold text-slate-900 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        <span>{event.guestCount.toLocaleString()} guests</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Ordered Requirements</span>
                      <div className="font-bold text-slate-900 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>{eventOrders.length} Orders ({approvedCount} Approved)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Booked by: <strong>{event.createdBy.name} ({event.createdBy.role})</strong></span>
                  <span className="font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Requirements</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setSelectedEvent(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-xl w-full flex pl-10">
            <div className="w-full bg-white border-l border-slate-200 text-slate-800 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedEvent.eventType}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {selectedEvent.title}
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-1 flex-wrap">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{selectedEvent.venue}</span>
                    <span>·</span>
                    <span>Client: <strong className="text-slate-800">{selectedEvent.clientName}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Event Overview &amp; Special Instructions
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedEvent.description}
                  </p>
                  {selectedEvent.specialInstructions && (
                    <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <strong>Special Venue Instruction:</strong> {selectedEvent.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Ordered Requirements List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ordered Requirements ({orders.filter(o => o.eventId === selectedEvent.id).length})
                    </h4>

                    {canOrderRequirements && (
                      <button
                        onClick={() => {
                          onOpenNewOrder(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Order Requirement</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {orders.filter(o => o.eventId === selectedEvent.id).length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                        No requirements ordered for this event yet.
                      </div>
                    ) : (
                      orders.filter(o => o.eventId === selectedEvent.id).map(ord => {
                        const vendor = vendors.find(v => v.id === ord.vendorId);
                        const isApproved = ord.status === 'MANAGEMENT_APPROVED';

                        return (
                          <div
                            key={ord.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-800">{ord.orderNumber}</span>
                                <span className="text-slate-300">·</span>
                                <span className="font-bold text-slate-900 truncate">{ord.requirementTitle}</span>
                              </div>
                              <div className="text-[11px] text-slate-600">
                                Vendor: <strong>{vendor?.name || 'Assigned Vendor'}</strong> · {ord.requiredDate} at {ord.requiredTime}
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                {canOrderRequirements && (
                  <button
                    onClick={() => {
                      onOpenNewOrder(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    + Order Requirement for this Event
                  </button>
                )}

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
