import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, AlertCircle } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEventId?: string;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedEventId
}) => {
  const { events, vendors, createOrder } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const [eventId, setEventId] = useState(preselectedEventId || events[0]?.id || '');
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [requirementTitle, setRequirementTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredDate, setRequiredDate] = useState(today);
  const [requiredTime, setRequiredTime] = useState('08:00 AM');
  const [venueLocation, setVenueLocation] = useState('');

  useEffect(() => {
    if (isOpen) {
      const targetEventId = preselectedEventId || events[0]?.id || '';
      setEventId(targetEventId);
      setVendorId(vendors[0]?.id || '');
      const ev = events.find(x => x.id === targetEventId);
      setVenueLocation(ev?.venue || '');
      if (ev?.startDate) {
        setRequiredDate(ev.startDate.slice(0, 10));
      } else {
        setRequiredDate(new Date().toISOString().slice(0, 10));
      }
    }
  }, [isOpen, preselectedEventId, events, vendors]);

  if (!isOpen) return null;

  const selectedVendor = vendors.find(v => v.id === vendorId);
  const canSubmit = Boolean(eventId && vendorId && requirementTitle.trim() && description.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    createOrder({
      eventId,
      vendorId,
      requirementTitle: requirementTitle.trim(),
      description: description.trim(),
      requiredDate,
      requiredTime,
      venueLocation: venueLocation.trim()
    });

    setRequirementTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <FileText className="w-4 h-4" />
              <span>Vendor Requirement Order</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Order Requirements to Vendor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatches requirements to the registered vendor with scheduled setup date &amp; time.
          </p>

          {(events.length === 0 || vendors.length === 0) && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Prerequisites needed before dispatching an order:</p>
                {events.length === 0 && <p>· Create at least one event first.</p>}
                {vendors.length === 0 && <p>· Register at least one Vendor user in User Rights Management.</p>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Event *</label>
                <select
                  value={eventId}
                  disabled={events.length === 0}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    const ev = events.find(x => x.id === e.target.value);
                    if (ev) {
                      setVenueLocation(ev.venue);
                      if (ev.startDate) setRequiredDate(ev.startDate.slice(0, 10));
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-600 disabled:bg-slate-50"
                >
                  {events.length === 0 ? (
                    <option value="">No events available</option>
                  ) : (
                    events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Vendor Partner *</label>
                <select
                  value={vendorId}
                  disabled={vendors.length === 0}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-amber-600 disabled:bg-slate-50"
                >
                  {vendors.length === 0 ? (
                    <option value="">No vendors registered</option>
                  ) : (
                    vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.contactPerson})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Requirement Title *</label>
              <input
                type="text"
                required
                placeholder="Describe the requirement item or setup service"
                value={requirementTitle}
                onChange={(e) => setRequirementTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Required Setup Date *</label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Required Setup Time *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 08:00 AM"
                  value={requiredTime}
                  onChange={(e) => setRequiredTime(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Venue Room / Setup Location *</label>
              <input
                type="text"
                required
                placeholder="Specific room or stage location"
                value={venueLocation}
                onChange={(e) => setVenueLocation(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Detailed Specifications &amp; Requirements *</label>
              <textarea
                rows={3}
                required
                placeholder="Specify quantities, setup details, and photo verification expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
              />
            </div>

            {selectedVendor && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Order Workflow:</strong> {selectedVendor.name} will receive an alert with the required date ({requiredDate}) and time ({requiredTime}), then upload a setup photo proof for two-level verification.
              </div>
            )}

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
                disabled={!canSubmit}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                Dispatch Order to Vendor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
