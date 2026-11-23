import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorOrder } from '../../types';
import { X, Camera, Upload, Image as ImageIcon } from 'lucide-react';

interface SubmitProofModalProps {
  order: VendorOrder | null;
  onClose: () => void;
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({ order, onClose }) => {
  const { submitSetupProof } = useApp();

  const [imageUrl, setImageUrl] = useState(order?.setupProof?.imageUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setImageUrl(order?.setupProof?.imageUrl || '');
    setCustomUrlInput('');
    setNotes('');
    setErrorMsg('');
  }, [order]);

  if (!order) return null;

  const previewUrl = customUrlInput.trim() || imageUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMsg('Please upload a setup photo from your device/camera or enter a photo URL.');
      return;
    }
    submitSetupProof(order.id, previewUrl, notes || 'Setup verified and complete on site.');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setCustomUrlInput('');
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Camera className="w-4 h-4" />
              <span>Setup Proof Submission</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Submit Setup Photo Proof
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Order: <strong className="text-slate-900">{order.orderNumber} - {order.requirementTitle}</strong>
          </p>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Location: {order.venueLocation} · Required: {order.requiredDate} at {order.requiredTime}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Image Preview Box */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Setup Proof Image Preview *
              </label>
              {previewUrl ? (
                <div className="w-full h-52 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 relative">
                  <img
                    src={previewUrl}
                    alt="Proof preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                    Timestamp: {new Date().toLocaleTimeString()} · Ready to submit
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No setup photo selected yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Capture or upload a photo from your device, or paste an image URL below.
                  </p>
                </div>
              )}
            </div>

            {/* File Upload / Custom URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Upload from Device / Camera:
                </label>
                <label className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5 text-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-xs font-semibold">Choose or Capture Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Or Paste Photo URL:
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={customUrlInput}
                  onChange={(e) => {
                    setCustomUrlInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Setup Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Setup Completion Notes *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Describe completed setup details and readiness..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-600"
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
                disabled={!previewUrl}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Submit Proof for Verification</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
