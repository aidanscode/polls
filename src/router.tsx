import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import CreatePoll from './components/polls/create';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CreatePoll /> },
      { path: '/login', element: <p>Log In</p> },
      { path: '/poll/:id', element: <p>A poll!!!!!</p> }
    ]
  }
]);
