if (!globalThis.__llnbet_match_cache) {
  globalThis.__llnbet_match_cache = {
    matches: [],
    lastFetched: 0,
    syncInProgress: false
  };
}

module.exports = {
  matchCache: globalThis.__llnbet_match_cache
};
