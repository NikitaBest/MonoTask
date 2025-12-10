import './Logo404.css';

function Logo404() {
  return (
    <div className="logo-404" aria-label="404 Logo">
      <div className="logo-404__digit logo-404__digit--first">
        <div className="logo-404__square logo-404__square--top">
          <img src="/square.svg" alt="" aria-hidden="true" />
        </div>
        <img src="/4.svg" alt="4" aria-hidden="true" className="logo-404__digit-image" />
      </div>
      <div className="logo-404__digit logo-404__digit--zero">
        <img src="/empty_square.svg" alt="0" aria-hidden="true" className="logo-404__digit-image" />
      </div>
      <div className="logo-404__digit logo-404__digit--second">
        <img src="/4.svg" alt="4" aria-hidden="true" className="logo-404__digit-image" />
        <div className="logo-404__square logo-404__square--bottom">
          <img src="/square.svg" alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default Logo404;

