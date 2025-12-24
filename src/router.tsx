import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import CreatePoll from './components/polls/create';
import AuthForm from './components/AuthForm';
import ViewPoll from './components/polls/view';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CreatePoll /> },
      { path: '/login', element: <AuthForm /> },
      { path: '/poll/:id', element: <ViewPoll /> }
    ]
  }
]);
