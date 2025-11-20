import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';

export default function AppWithRedux() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
