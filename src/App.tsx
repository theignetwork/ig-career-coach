import { useState } from 'react';
import { ChatBubble } from './components/ChatBubble';
import { ChatModal } from './components/ChatModal';
import { useToolContext } from './hooks/useToolContext';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const toolContext = useToolContext();

  return (
    <div className="font-sans antialiased text-base">
      {!isOpen && <ChatBubble onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <ChatModal
          toolContext={toolContext}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;