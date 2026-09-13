import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Problems } from './pages/Problems';
import { ProblemForm } from './pages/ProblemForm';
import { Resources } from './pages/Resources';
import { ResourceForm } from './pages/ResourceForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div className="text-zinc-400">Welcome to PrepGoat CMS. Select a module from the sidebar.</div>} />
          <Route path="problems" element={<Problems />} />
          <Route path="problems/:id" element={<ProblemForm />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:id" element={<ResourceForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
