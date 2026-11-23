import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventType } from '../../types';
import { X, Building2, Plus } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewVenue?: () => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onOpenNewVenue }) => {
  const { createEvent, currentUser, venues } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventType, setEventType] = useState<EventType>('CONFERENCE');
  const [venue, setVenue] = useState(venues[0]?.name || '');
  const [startDate, setStartDate] = useState(`${today}T09:00`);
  const [endDate, setEndDate] = useState(`${today}T18:00`);
  const [guestCount, setGuestCount] = useState(100);
  const [description, setDescription] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const canBookVenues = currentUser.rights.canBookVenues;
  const canManageVenues = currentUser.rights.canManageVenues;

  useEffect(() => {
    if (isOpen) {
      if (canBookVenues) {
        setVenue(prev => (venues.some(v => v.name === prev) ? prev : venues[0]?.name || ''));
      } else {
        setVenue('Venue Assignment Pending');
      }
    }
  }, [isOpen, venues, canBookVenues]);

  if (!isOpen) return null;

  const missingRequiredVenue = canBookVenues && venues.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || missingRequiredVenue) return;

    createEvent({
      title: title.trim(),
      clientName: clientName.trim(),
      eventType,
      venue: canBookVenues ? venue : 'Venue Assignment Pending',
      startDate,
      endDate,
      guestCount: Number(guestCount),
      status: 'UPCOMING',
      description: description.trim() || 'Scheduled hotel event.',
      specialInstructions: specialInstructions.trim() || undefined
    });

    setTitle('');
    setClientName('');
    setDescription('');
    setSpecialInstructions('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Building2 className="w-4 h-4" />
              <span>{canBookVenues ? 'Venue Booking & Event Creation' : 'Event Creation'}</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            {canBookVenues ? 'Book Venue & Schedule Event' : 'Schedule Event'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {canBookVenues
              ? 'Reserve a configured hotel venue space and register event details.'
              : 'Create an event record. Note: Book Venues right is disabled on your account.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="Enter event name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="Client or host name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Event Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-600"
                >
                  <option value="CONFERENCE">Conference / Convention</option>
                  <option value="GALA">Charity Gala / Banquet</option>
                  <option value="WEDDING">Wedding</option>
                  <option value="BANQUET">Corporate Dinner</option>
                  <option value="EXHIBITION">Exhibition / Expo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Hotel Venue Space *</label>
                {!canBookVenues ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px]">
                    Requires Book Venues right to select a venue.
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1.5">
                    <div>No venues created yet.</div>
                    {canManageVenues && onOpenNewVenue && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenNewVenue();
                        }}
                        className="font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Venue First</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-600"
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.maxCapacity} cap · {v.buildingOrFloor})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Expected Guests</label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Start Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">End Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Description &amp; Overview</label>
              <textarea
                rows={2}
                placeholder="Brief summary of event requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Special Setup / Venue Instructions</label>
              <textarea
                rows={2}
                placeholder="Optional setup or access instructions for vendors..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={missingRequiredVenue}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold rounded-lg transition-colors shadow-xs"
              >
                {canBookVenues ? 'Book Venue & Save Event' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
