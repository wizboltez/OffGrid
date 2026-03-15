"use client";

import { Button } from "components/ui/Button";

export function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <Button className="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
