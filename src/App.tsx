import Chat from "./Chat";
import ChatBasic from "./Chatbasic";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function App() {
  return (
    <>
      <Router>
        <nav>
          <Link to="/">Basic</Link> | <Link to="/chat">Chat</Link>
        </nav>
        <main className="chat">
          <Routes>
            <Route path="/" element={<ChatBasic />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </Router>
    </>
  );
}
