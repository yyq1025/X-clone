import { useEffect } from "react";

interface InfiniteScrollProps {
  fetchMore: () => Promise<any>;
  hasMore: boolean;
  isFetching: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  isFetching,
  threshold = 300,
}: InfiniteScrollProps) => {
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isFetching) return;

      const { innerHeight, scrollY } = window;
      const { scrollHeight } = document.documentElement;

      if (scrollY + innerHeight >= scrollHeight - threshold) {
        fetchMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchMore, hasMore, isFetching, threshold]);
};
