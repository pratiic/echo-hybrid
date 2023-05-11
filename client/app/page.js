import { Provider } from "react-redux";
import { store } from "../redux/store";

const Home = () => {
  return (
    <Provider store={store}>
      <main>C2C and B2C e-commerce platform</main>
    </Provider>
  );
};

export default Home;
