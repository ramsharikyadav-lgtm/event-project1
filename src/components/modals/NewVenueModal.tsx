import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Users, Plus, Check } from 'lucide-react';

interface NewVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_AMENITIES = [
  '4K Ceiling Rigging Grid',
  'Dimmable Architectural Lighting',
  'Direct Freight Lift Access',
  'Soundproof Acoustic Isolation',
  'Adjacent Prep Galley / Kitchen',
  'Panoramic Floor-to-Ceiling Windows',
  'Outdoor Terrace / Lawn Access',
  'Simultaneous Translation Cabins',
  'Private VIP Dressing / Green Room'
];

const COMMON_STYLES = ['Banquet', 'Theater', 'Reception', 'Classroom', 'Ceremony', 'U-Shape'];

export const NewVenueModal: React.FC<NewVenueModalProps> = ({ isOpen, onClose }) => {
  const { createVenue, currentUser } = useApp();

  const [name, setName] = useState('');
  const [buildingOrFloor, setBuildingOrFloor] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(200);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Banquet', 'Reception']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createVenue({
      name: name.trim(),
      buildingOrFloor: buildingOrFloor.trim(),
      maxCapacity: Number(maxCapacity),
      setupStyles: selectedStyles.length > 0 ? selectedStyles : ['Banquet'],
      amenities: selectedAmenities,
      description: description.trim() || 'Configured hotel event venue.',
      status: 'ACTIVE'
    });

    setName('');
    setBuildingOrFloor('');
    setMaxCapacity(200);
    setSelectedStyles(['Banquet', 'Reception']);
    setSelectedAmenities([]);
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
              <Building2 className="w-4 h-4" />
              <span>Hotel Venue Management</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Create Hotel Venue &amp; Space
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add a new ballroom, pavilion, garden, or executive hall. New venues will instantly appear in event bookings and requirement order forms.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Venue Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Imperial Diamond Banquet Salon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Building &amp; Floor Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Wing - Level 3"
                  value={buildingOrFloor}
                  onChange={(e) => setBuildingOrFloor(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Max Guest Capacity *</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Supported Setup Styles */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Supported Setup Styles:</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_STYLES.map(style => {
                  const isSelected = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                      <span>{style}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venue Amenities */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Venue Amenities &amp; Rigging Capabilities:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                {COMMON_AMENITIES.map(amenity => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-1.5 rounded text-left text-[11px] transition-colors flex items-center gap-1.5 ${
                        isSelected ? 'bg-amber-100/70 text-amber-900 font-semibold' : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Venue Description</label>
              <textarea
                rows={2}
                placeholder="Architectural style, ceiling height, acoustic properties, best use cases..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Venue</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
