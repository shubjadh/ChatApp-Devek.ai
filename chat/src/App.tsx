import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/chat';
import ChatHistory from './components/chatHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/history" element={<ChatHistory />} />
      </Routes>
    </Router>
  );
}

export default App;