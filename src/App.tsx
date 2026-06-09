import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectList from "@/pages/ProjectList";
import ProjectWorkspace from "@/pages/ProjectWorkspace";
import Timeline from "@/pages/Timeline";
import Markup from "@/pages/Markup";
import Preview from "@/pages/Preview";
import Export from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/project/:id" element={<ProjectWorkspace />}>
          <Route index element={<Timeline />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="markup" element={<Markup />} />
          <Route path="preview" element={<Preview />} />
          <Route path="export" element={<Export />} />
        </Route>
      </Routes>
    </Router>
  );
}
