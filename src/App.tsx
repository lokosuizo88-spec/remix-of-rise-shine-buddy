import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AlarmHome from "./pages/AlarmHome";
import CreateAlarm from "./pages/CreateAlarm";
import EditAlarm from "./pages/EditAlarm";
import AlarmRinging from "./pages/AlarmRinging";
import Victory from "./pages/Victory";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Toaster />
    <Routes>
      <Route path="/" element={<AlarmHome />} />
      <Route path="/alarm/create" element={<CreateAlarm />} />
      <Route path="/alarm/edit/:id" element={<EditAlarm />} />
      <Route path="/alarm/ringing" element={<AlarmRinging />} />
      <Route path="/victory" element={<Victory />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
