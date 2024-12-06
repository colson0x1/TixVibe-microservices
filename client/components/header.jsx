import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && {
      label: 'Sign In',
      href: '/auth/signin',
      className: 'btn-outline-primary me-2',
    },
    !currentUser && {
      label: 'Sign Up',
      href: '/auth/signup',
      className: 'btn-primary',
    },
    currentUser && {
      label: 'Sell Tickets',
      href: '/tickets/new',
    },
    currentUser && {
      label: 'My Orders',
      href: '/orders',
    },
    currentUser && {
      label: 'Sign Out',
      href: '/auth/signout',
      className: 'btn-outline-danger',
    },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href, className }) => {
      return (
        <li key={href} className='nav-item'>
          <Link href={href} className={`btn ${className}`}>
            {label}
          </Link>
        </li>
      );
    });

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
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  );
};

export default Header;
