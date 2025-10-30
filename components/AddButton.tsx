"use client";
import { useFormStatus } from "react-dom";

export function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add staff"}
    </button>
  );
}
