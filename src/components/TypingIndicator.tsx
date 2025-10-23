export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-tile-bg border border-border-teal rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 bg-primary-teal rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
