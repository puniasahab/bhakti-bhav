import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageOff, LoaderCircle, LockKeyhole, RotateCcw, Search, X } from "lucide-react";
import { homePageAPis } from "../api";
import { LanguageContext } from "../contexts/LanguageContext";
import { getSubscriptionStatusFromLS, getTokenFromLS } from "../commonFunctions";
import { getSearchDestination, getSearchGroups, getSearchTitle } from "../utils/searchResults";
import "./Search.css";

function ResultImage({ src, title }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img src={src} alt={title} loading="lazy" decoding="async" onError={() => setFailed(true)} />
  ) : (
    <span className="search-image-fallback" role="img" aria-label={title || "Image unavailable"}>
      <ImageOff size={40} aria-hidden="true" />
    </span>
  );
}

export default function SearchPage() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const term = query.trim();
  const [result, setResult] = useState({ status: "idle", groups: [], term: "", language });
  const [retry, setRetry] = useState(0);
  const [composing, setComposing] = useState(false);
  const activeRequest = useRef(null);
  const inputRef = useRef(null);
  const screenRef = useRef(null);
  const isSubscribed = getSubscriptionStatusFromLS();
  const hasToken = Boolean(getTokenFromLS());
  const canSearch = term.length >= 2 && !composing;
  const status = !canSearch ? "idle" : result.term === term && result.language === language ? result.status : "loading";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!canSearch) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setResult({ status: "loading", groups: [], term, language });
    const timer = setTimeout(async () => {
      try {
        const response = await homePageAPis.searchApi(term, language, 50, controller.signal);
        if (controller.signal.aborted) return;
        const groups = getSearchGroups(response);
        setResult({ status: "success", groups, term, language });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ status: "error", groups: [], term, language });
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, term, language, canSearch, retry]);

  const closeSearch = (goHome = false) => {
    activeRequest.current?.abort();
    const from = location.state?.from;
    const returnTo = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/search") ? from : "/";
    navigate(goHome ? "/" : returnTo, { replace: true });
  };

  const changeQuery = (event) => {
    activeRequest.current?.abort();
    const nextParams = new URLSearchParams(params);
    const value = event.target.value;
    if (value) nextParams.set("q", value);
    else nextParams.delete("q");
    setParams(nextParams, { replace: true, state: location.state });
    screenRef.current?.scrollTo?.({ top: 0 });
  };

  return (
    <div className="search-screen" ref={screenRef} onKeyDown={(event) => {
      if (event.key === "Escape") closeSearch();
    }}>
      <header className="search-header">
        <div className="search-toolbar">
          <button className="search-icon-button search-back" type="button" aria-label="Back to home" title="Back to home" onClick={() => closeSearch(true)}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <form className="search-field" role="search" onSubmit={(event) => { event.preventDefault(); inputRef.current?.blur(); }}>
            <Search className="search-field-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              aria-label="Search deities, mantras, vrat"
              placeholder="Search deities, mantras, vrat..."
              autoComplete="off"
              value={query}
              onChange={changeQuery}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
            />
            <button className="search-icon-button search-close" type="button" aria-label="Close search" title="Close search" onClick={() => closeSearch()}>
              <X aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      <main className="search-main" aria-label="Search results" aria-busy={status === "loading"}>
        <div role="status" aria-live="polite" className="search-sr-only">
          {status === "loading" ? "Searching..." : status === "success" ? `${result.groups.reduce((count, group) => count + group.items.length, 0)} results found` : ""}
        </div>
        {status === "idle" && (
          <div className="search-state">
            <Search className="search-state-icon" aria-hidden="true" />
            <p>Type at least 2 characters to search</p>
          </div>
        )}
        {status === "loading" && (
          <div className="search-state">
            <LoaderCircle className="search-spinner" aria-hidden="true" />
            <p>Searching...</p>
          </div>
        )}
        {status === "error" && (
          <div className="search-state" role="alert">
            <Search className="search-state-icon" aria-hidden="true" />
            <p>Unable to load results. Please try again.</p>
            <button type="button" className="search-retry" onClick={() => setRetry((value) => value + 1)}>
              <RotateCcw size={18} aria-hidden="true" /> Try again
            </button>
          </div>
        )}
        {status === "success" && !result.groups.length && (
          <div className="search-state">
            <Search className="search-state-icon" aria-hidden="true" />
            <p>No results found for &quot;{term}&quot;</p>
          </div>
        )}
        {status === "success" && result.groups.map((group) => (
          <section className="search-section" key={group.key} aria-label={group.title}>
            <h2>{group.title}</h2>
            <div className="search-grid">
              {group.items.map((item) => {
                const title = getSearchTitle(item, language);
                const locked = item.accessType === "paid" && !isSubscribed;
                const destination = locked ? (hasToken ? "/payment" : "/login") : getSearchDestination(item, group.key, window.location.origin);
                const external = destination && /^https?:\/\//.test(destination);
                const content = (
                  <>
                    <div className={`search-card-content${locked ? " search-card-blurred" : ""}`} aria-hidden={locked || undefined}>
                      <ResultImage key={item.imageUrl} src={item.imageUrl} title={title || group.title} />
                      {title && <span className="search-card-title">{title}</span>}
                    </div>
                    {locked && <><span className="search-card-shade" /><span className="search-lock"><LockKeyhole size={17} aria-hidden="true" /></span></>}
                  </>
                );
                const props = { className: "search-card", "aria-label": `${title || group.title}${locked ? " (subscription required)" : ""}` };
                return external ? (
                  <a key={item.id || item._id} {...props} href={destination} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : destination ? (
                  <Link key={item.id || item._id} {...props} to={destination}>{content}</Link>
                ) : (
                  <div key={item.id || item._id} {...props}>{content}</div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
