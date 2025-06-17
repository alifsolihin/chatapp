import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatRoom from "./pages/ChatRoom";
import ManageMembers from "./pages/ManageMembers";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:roomName" element={<ChatRoom />} />
        <Route
          path="/room/:roomName/manage-members"
          element={<ManageMembers />}
        />
      </Routes>
    </Router>
  );
}

export default App;
