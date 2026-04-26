import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-5 py-2 rounded-full bg-white/90 backdrop-blur text-black font-medium hover:scale-105 transition disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    className="px-5 py-3 rounded-full bg-white/10 backdrop-blur text-white outline-none w-72 placeholder:text-zinc-400"
  />
);

const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

const fetchSongs = async (query) => {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=50`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;

    const playable = data.results.filter((track) => track.previewUrl);
    if (playable.length === 0) return null;

    const explicitTracks = playable.filter(
      (t) => t.trackExplicitness === "explicit"
    );

    const finalList = explicitTracks.length >= 8 ? explicitTracks : playable;

    return shuffle(finalList)
      .slice(0, 15)
      .map((track) => ({
        id: `${track.trackId}-${track.artistId || track.collectionId || Math.random()}`,
        title: track.trackName,
        artist: track.artistName,
        artwork: (track.artworkUrl100 || "").replace("100x100", "300x300"),
        year: track.releaseDate?.slice(0, 4) || "",
        preview: track.previewUrl,
        explicit: track.trackExplicitness === "explicit",
      }));
  } catch (error) {
    console.error("fetchSongs error", error);
    return null;
  }
};

export default function App() {
  const [query, setQuery] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const audioRef = useRef(null);
  const x = useMotionValue(0);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const openLogin = () => {
    setAuthMode("login");
    setShowAuth(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setShowAuth(true);
  };

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Enter your email and password.");
      return;
    }

    setUser({
      name: loginEmail.split("@")[0] || "User",
      email: loginEmail,
    });
    setShowAuth(false);
  };

  const handleCreateAccount = () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      alert("Fill out all create account fields.");
      return;
    }

    setUser({
      name: signupName,
      email: signupEmail,
    });
    setShowAuth(false);
  };

  const handleGoogleAuth = () => {
    setUser({
      name: authMode === "signup" ? "New Google User" : "Google User",
      email: "google@example.com",
    });
    setShowAuth(false);
  };

  const handleLogout = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setUser(null);
  };

  const generatePlaylist = async () => {
    if (!query.trim()) {
      alert("Type an artist, genre, year, or mood first.");
      return;
    }

    setLoading(true);
    setPlaylist([]);
    setCurrentTrack(null);
    setIsPlaying(false);

    const searchTerms = [query, `${query} songs`, `${query} music`, `${query} playlist`];

    let songs = null;
    for (const term of searchTerms) {
      songs = await fetchSongs(term);
      if (songs?.length) break;
    }

    setLoading(false);

    if (!songs || songs.length === 0) {
      alert("No results found. Try another artist, genre, mood, or year.");
      return;
    }

    setPlaylist(songs);
    x.set(0);
  };

  const playSong = async (song) => {
    if (!song.preview) {
      alert("No preview available for this track.");
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(song.preview);
      audioRef.current = audio;
      setCurrentTrack(song);

      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("playSong error", error);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("togglePlayPause error", error);
    }
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const CARD_WIDTH = 264;

  const snapToCenter = () => {
    const currentX = x.get();
    const index = Math.max(0, Math.min(playlist.length - 1, Math.round(-currentX / CARD_WIDTH)));
    x.set(-index * CARD_WIDTH);
  };

  return (
    <div className="min-h-screen bg-gradient-to from-black via-zinc-900 to-black text-white">
      <div className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">AI Music</h1>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button onClick={openLogin} className="px-4">
                Login
              </Button>
              <Button
                onClick={openSignup}
                className="px-4 bg-transparent text-white border border-white/15 hover:bg-white/10"
              >
                Create Account
              </Button>
            </>
          ) : (
            <Button onClick={handleLogout} className="px-4">
              Log Out
            </Button>
          )}
        </div>
      </div>

      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md">
          <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-gradient-to from-zinc-950 via-black to-zinc-900 p-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sm font-semibold">
                  A
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Welcome to</div>
                  <div className="text-xl font-semibold tracking-wide">AI Music</div>
                </div>
              </div>

              <div className="max-w-md space-y-5">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-zinc-300">
                  Discover • Generate • Listen
                </div>
                <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                  {authMode === "signup"
                    ? "Create your account and start building your next playlist."
                    : "Sign in and jump back into your music instantly."}
                </h2>
                <p className="text-base leading-7 text-zinc-400">
                  Access AI-generated playlists, smarter recommendations, and personalized listening tools in one place.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-semibold">AI</div>
                  <div className="mt-1 text-zinc-400">Playlist generation</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-semibold">15</div>
                  <div className="mt-1 text-zinc-400">Tracks per mix</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-semibold">Live</div>
                  <div className="mt-1 text-zinc-400">Preview playback</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-8">
              <div className="w-full max-w-md rounded-2rem border border-white/10 bg-zinc-950/90 p-8 shadow-2xl shadow-black/30">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-zinc-400">Account access</div>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                      {authMode === "signup" ? "Create Account" : "Login"}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      {authMode === "signup"
                        ? "Create a new account with Google or email."
                        : "Login with Google or your email and password."}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuth(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleAuth}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.21 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.297 4.337-17.694 10.691z" />
                      <path fill="#4CAF50" d="M24 44c5.168 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.189 0-9.617-3.317-11.283-7.946l-6.522 5.025C9.555 39.556 16.227 44 24 44z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    {authMode === "signup" ? "Create Account with Google" : "Login with Google"}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-[0.24em] text-zinc-500">
                      <span className="bg-zinc-950 px-3">or</span>
                    </div>
                  </div>

                  {authMode === "signup" ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Email</label>
                        <input
                          type="email"
                          placeholder="name@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Password</label>
                        <input
                          type="password"
                          placeholder="Create a password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
                        />
                      </div>
                      <button
                        onClick={handleCreateAccount}
                        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
                      >
                        Create Account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Email</label>
                        <input
                          type="email"
                          placeholder="name@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-300">Password</label>
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
                        />
                      </div>
                      <button
                        onClick={handleLogin}
                        className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90"
                      >
                        Login
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                    <span>
                      {authMode === "signup" ? "Already have an account?" : "Need an account?"}
                    </span>
                    <button
                      onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                      className="text-white hover:underline"
                    >
                      {authMode === "signup" ? "Login" : "Create account"}
                    </button>
                  </div>

                  <p className="text-center text-xs leading-6 text-zinc-500">
                    By continuing, you agree to the Terms of Use and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen gap-8 pt-20 px-4">
        <h1 className="text-5xl font-semibold text-center">Discover Music Your Way</h1>

        <div className="flex gap-3 flex-wrap justify-center">
          <Input
            placeholder="Artist, genre, year, or mood"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") generatePlaylist();
            }}
          />
          <Button onClick={generatePlaylist} disabled={loading}>
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>

        {playlist.length > 0 && (
          <div className="w-full overflow-hidden mt-10">
            <motion.div
              style={{ x }}
              drag="x"
              dragConstraints={{ left: -CARD_WIDTH * Math.max(0, playlist.length - 1), right: 0 }}
              onDragEnd={snapToCenter}
              className="flex gap-6 px-10"
            >
              {playlist.map((song) => (
                <motion.div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className={`min-w-240px h-320px rounded-3xl overflow-hidden relative shadow-2xl cursor-pointer ${
                    currentTrack?.id === song.id ? "ring-2 ring-white" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-sm font-semibold">{song.title}</div>
                    <div className="text-xs text-zinc-300">
                      {song.artist}{song.year ? ` • ${song.year}` : ""} {song.explicit ? "🅴" : ""}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {currentTrack && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
            <span className="text-sm max-w-260px truncate">
              {currentTrack.title} - {currentTrack.artist}
            </span>
            <Button onClick={togglePlayPause} className="px-4">
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={stopPlayback} className="px-4">
              Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
