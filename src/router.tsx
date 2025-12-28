import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import CreatePoll from './components/polls/create';
import ViewPoll from './components/polls/view';
import NotFound from './components/NotFound';
import MyPolls from './components/polls/my-polls';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CreatePoll /> },
      { path: '/poll/:id', element: <ViewPoll /> },
      { path: '/my-polls', element: <MyPolls /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
