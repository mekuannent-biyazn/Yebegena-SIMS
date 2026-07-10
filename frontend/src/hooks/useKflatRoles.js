import { useEffect, useState } from "react";
import { kflatRoleService } from "../services/kflatService";

/**
 * Loads Kflat roles whenever a Kflat is selected.
 * Clears the list when no Kflat is selected, since the backend
 * rejects a kflatRole submitted without a kflat.
 */
export function useKflatRoles(kflatId) {
  const [kflatRoles, setKflatRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!kflatId) {
      setKflatRoles([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getKflatRoles(kflatId);
        if (isMounted) setKflatRoles(Array.isArray(result) ? result : []);
      } catch (err) {
        if (isMounted) setError(err.friendlyMessage || "Failed to load roles");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [kflatId]);

  return { kflatRoles, isLoading, error };
}
