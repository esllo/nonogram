import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <Link to={'/solve'}>
        <button>solve</button>
      </Link>
      <Link to={'/draw'}>
        <button>draw</button>
      </Link>
    </div>
  );
};

export default Home;
