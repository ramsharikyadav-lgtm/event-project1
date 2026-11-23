import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewVenueModal } from '../modals/NewVenueModal';
import { 
  Building2, 
  Plus, 
  Users, 
  CheckCircle2, 
  Trash2, 
  Search
} from 'lucide-react';

export const VenueManagementView: React.FC = () => {
  const { venues, events, removeVenue, currentUser, notifyAlert } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [newVenueModalOpen, setNewVenueModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.buildingOrFloor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManageVenues = currentUser.rights.canManageVenues;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Hotel Property &amp; Facilities</span>
            <span className="text-slate-300">·</span>
            <span>Venue Spaces</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Hotel Venues &amp; Banquet Spaces
          </h2>
          <p className="text-xs text-slate-600 max-w-xl mt-0.5">
            Create and configure hotel venue spaces, guest capacities, rigging amenities, and supported setup styles.
          </p>
        </div>

        {canManageVenues && (
          <button
            onClick={() => setNewVenueModalOpen(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Venue</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search venue name, wing, floor, or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 shadow-2xs"
          />
        </div>

        <div className="text-xs text-slate-500">
          Total Spaces: <strong className="text-slate-900">{venues.length} Venues</strong>
        </div>
      </div>

      {/* Venues Grid or Empty State */}
      {filteredVenues.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs space-y-2.5">
          <Building2 className="w-9 h-9 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-800">No hotel venues configured yet</p>
          <p className="max-w-md mx-auto text-slate-500">
            {venues.length === 0
              ? 'Create your first ballroom, salon, garden, or pavilion so staff can book venues for upcoming events.'
              : 'No venues match your search filter.'}
          </p>
          {canManageVenues && venues.length === 0 && (
            <button
              onClick={() => setNewVenueModalOpen(true)}
              className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Venue</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVenues.map(venue => {
            const bookedEvents = events.filter(e => e.venue.includes(venue.name) || venue.name.includes(e.venue));
            const isConfirming = confirmDeleteId === venue.id;

            return (
              <div
                key={venue.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {venue.buildingOrFloor}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {venue.name}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active Venue</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {venue.description}
                  </p>

                  {/* Capacity & Setup Styles */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        <span>Maximum Capacity:</span>
                      </span>
                      <strong className="font-mono text-slate-900 font-bold">{venue.maxCapacity.toLocaleString()} guests</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Supported Setups:</span>
                      <div className="flex flex-wrap gap-1">
                        {venue.setupStyles.map(st => (
                          <span key={st} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {venue.amenities.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rigging &amp; Facilities:</span>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.map(am => (
                          <span key={am} className="px-2 py-0.5 rounded bg-amber-50/50 text-amber-900 border border-amber-200/80 text-[10px]">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Booked Events: <strong className="text-slate-900 font-mono">{bookedEvents.length}</strong>
                  </span>

                  {canManageVenues && (
                    isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            removeVenue(venue.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (bookedEvents.length > 0) {
                            notifyAlert(
                              'Cannot Remove Venue',
                              `"${venue.name}" has ${bookedEvents.length} scheduled event(s).`,
                              'revision'
                            );
                            return;
                          }
                          setConfirmDeleteId(venue.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete venue space"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create Venue */}
      {canManageVenues && (
        <NewVenueModal
          isOpen={newVenueModalOpen}
          onClose={() => setNewVenueModalOpen(false)}
        />
      )}
    </div>
  );
};
