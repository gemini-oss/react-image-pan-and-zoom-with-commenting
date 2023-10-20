import React from "react";

const MEDIA_QUERIES = {
  xs: "(max-width: 800px)",
};

const useMediaQuery = () => {
  const mediaQueries = React.useRef<{ query: MediaQueryList; key: string }[]>(
    []
  );
  const [matches, setMatches] = React.useState<{
    [key: string]: boolean | null;
  }>(() => {
    return Object.keys(MEDIA_QUERIES).reduce((accum, curValue) => {
      accum[curValue] = null;
      return accum;
    }, {} as { [key: string]: boolean | null });
  });

  React.useEffect(() => {
    const handleMediaChange =
      (mediaQuery: MediaQueryList, key: string) => () => {
        if (mediaQuery.matches) {
          setMatches((prev) => ({
            ...prev,
            [key]: true,
          }));
        } else {
          setMatches((prev) => ({
            ...prev,
            [key]: false,
          }));
        }
      };

    Object.keys(MEDIA_QUERIES).forEach((key) => {
      const mediaQuery = window.matchMedia(
        MEDIA_QUERIES[key as keyof typeof MEDIA_QUERIES]
      );
      mediaQuery.addEventListener("change", handleMediaChange(mediaQuery, key));
      mediaQueries.current.push({ query: mediaQuery, key });

      handleMediaChange(mediaQuery, key)();
    });

    return () => {
      mediaQueries.current.forEach(({ query, key }) => {
        query.removeEventListener("change", handleMediaChange(query, key));
      });
    };
  }, []);

  return matches;
};

export default useMediaQuery;
