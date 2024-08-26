import Link from 'next/link';

const Header = ({ currentUser }) => {
  return (
    <nav className='navbar navbar-light bg-light px-4'>
      <Link className='navbar-brand' href='/'>
        {/* <a className='navbar-brand' style={{ color: 'orangered' }}>
          TixVibe
        </a> */}
        <span
          style={{ color: 'orangered', fontWeight: 'bold', fontSize: '3rem' }}
        >
          TixVibe
        </span>
      </Link>

      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>
          {/* {currentUser ? 'Sign out' : 'Sign in/up'} */}
          {currentUser ? (
            <li className='nav-item'>
              <a href='/' className='btn btn-outline-danger'>
                Sign out
              </a>
            </li>
          ) : (
            <>
              <li className='nav-item'>
                <a href='/' className='btn btn-outline-primary me-2'>
                  Sign in
                </a>
              </li>
              <li className='nav-item'>
                <a href='/' className='btn btn-primary'>
                  Sign up
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
