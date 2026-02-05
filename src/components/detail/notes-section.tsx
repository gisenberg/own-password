interface NotesSectionProps {
  notes: string;
}

export function NotesSection({ notes }: NotesSectionProps) {
  return (
    <div className="px-6 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        Notes
      </div>
      <pre className="mt-1 whitespace-pre-wrap break-words text-sm font-sans">
        {notes}
      </pre>
    </div>
  );
}
