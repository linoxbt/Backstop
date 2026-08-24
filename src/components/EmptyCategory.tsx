export function EmptyCategory({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-stone-line py-14 px-6 text-center">
      <p className="font-display text-lg mb-2">No {label.toLowerCase()} agents live right now</p>
      <p className="font-body text-sm text-ink-soft max-w-md mx-auto">
        Nothing in this category has passed Agent Studio verification and posted a manifest yet.
        Check back shortly, or view the other three categories below.
      </p>
    </div>
  );
}
