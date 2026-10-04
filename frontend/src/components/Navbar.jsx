import {
  Menu,
  Settings,
  Zap,
  X,
  Plus,
  LogOut
} from 'lucide-react';

import { navbarStyles as s } from '../assets/dummyStyles';

import { Logo } from '../assets/ui';

import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';

const links = [
  { label: "Home", to: "/" },
  { label: "My Projects", to: "/dashboard", protected: true },
  { label: "Community", to: "/community" },
  { label: "Pricing", to: "/pricing" },
];

const accountLinks = [
  {
    label: "Buy credits",
    icon: Zap,
    to: "/pricing",
    iconClass: s.accountIconIndigo
  },
  {
    label: "Settings",
    icon: Settings,
    to: "/settings"
  },
];

function UserMenu() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email || "U")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className={s.userMenuWrapper}>

      <button
        onClick={() => navigate("/pricing")}
        title="Buy more credits"
        className={s.creditsPill}
      >
        <Zap className={s.creditsIcon} />

        <span className={s.creditsLabel}>
          Credits :
        </span>

        <span className={s.creditsNumber}>
          {user.credits ?? 0}
        </span>

        <Plus className={s.plusIcon} />
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        className={s.avatar}
      >
        {initials}
      </button>

      {open && (
        <div className={s.dropdown}>

          <div className={s.dropdownHeader}>

            <div className={s.avatar}>
              {initials}
            </div>

            <div className={s.dropdownUserInfo}>
              <p className={s.dropdownUserName}>
                {user.name}
              </p>

              <p className={s.dropdownUserEmail}>
                {user.email}
              </p>
            </div>

          </div>

          <div className={s.dropdownBody}>

            {accountLinks.map(
              ({ label, icon: Icon, to, iconClass }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={s.dropdownItem}
                >
                  <Icon
                    className={`${s.iconMd} ${iconClass || ""}`}
                  />

                  {label}
                </Link>
              )
            )}

            <button
              onClick={() => {
                logoutUser();
                setOpen(false);
                navigate("/");
              }}
              className={s.dropdownSignOut}
            >
              <LogOut className={s.iconMd} />
              Sign Out
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const isAuthed = Boolean(user);
  const [open, setOpen] = useState(false);

  const visibleLink = links.filter(
    (l) => !l.protected || isAuthed
  );

  return (
    <nav className={s.root}>

      <div className={s.container}>

        <Logo />

        <div className={s.centerLinks}>

          {visibleLink.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `${s.navLinkBase} ${
                  isActive
                    ? s.navLinkActive
                    : s.navLinkInactive
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

        </div>

        <div className={s.desktopRight}>

          {isAuthed ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/login"
                className={s.signInLink}
              >
                Sign in
              </Link>

              <button
                onClick={() => navigate("/register")}
                className={`${s.btnPrimary} text-[13px] px-4 py-2`}
              >
                Get Started
              </button>
            </>
          )}

        </div>

        {/* Toggle */}

        <button
          onClick={() => setOpen(!open)}
          className={s.hamburger}
        >
          {open ? (
            <X className={s.hamburgerIcon} />
          ) : (
            <Menu className={s.hamburgerIcon} />
          )}
        </button>

      </div>

      {/* Mobile navigation */}

      {open && (
        <div className={s.mobileMenu}>

          {visibleLink.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={s.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          <div className={s.mobileDivider}>

            {isAuthed ? (
              <>
                {accountLinks.map(
                  ({ label, icon: Icon, to, iconClass }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={s.mobileAccountLink}
                    >
                      <Icon
                        className={`${s.iconSm} ${
                          iconClass || ""
                        }`}
                      />

                      {label}
                    </Link>
                  )
                )}

                <button
                  onClick={() => {
                    logoutUser();
                    setOpen(false);
                    navigate("/");
                  }}
                  className={s.mobileSignOut}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={`${s.btnPrimary} ${s.mobileAccountLink}`}
                >
                  Get Started
                </Link>
              </>
            )}

          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;