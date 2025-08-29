import React, { useState, memo } from "react";
import { Menu, X } from "lucide-react";

export default memo(function ContactMenu({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        aria-label="Open menu"
        className="p-2 rounded-lg hover:bg-gray-100"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
            onClick={() => {
              onNavigate("/contact");
              setOpen(false);
            }}
          >
            Get Support
          </button>
          <button
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
            onClick={() => {
              onNavigate("/userform");
              setOpen(false);
            }}
          >
            Book now
          </button>
        </div>
      )}
    </div>
  );
});
