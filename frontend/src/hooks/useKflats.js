import { useEffect, useState } from "react";
import { kflatService } from "../services/kflatService";

export function useKflats() {
  const [kflats, setKflats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await kflatService.getAll();
        const result = response.data?.data ?? response.data ?? [];
        if (isMounted) setKflats(Array.isArray(result) ? result : []);
      } catch (err) {
        if (isMounted) setError(err.friendlyMessage || "Failed to load Kflats");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { kflats, isLoading, error };
}
