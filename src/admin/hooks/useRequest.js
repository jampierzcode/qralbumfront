import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "../api.js";

/** Carga datos con estados de carga y error. `reload()` vuelve a pedir sin parpadeo. */
export function useRequest(fetcher, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const latest = useRef(0);

  const run = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++latest.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetcher();
        if (id === latest.current) setState({ loading: false, error: null, data });
        return data;
      } catch (error) {
        if (id === latest.current) setState((s) => ({ ...s, loading: false, error: errorMessage(error) }));
        return null;
      }
    },
    deps // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    run();
  }, [run]);

  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })), []);

  return { ...state, reload: () => run({ silent: true }), setData };
}
